package org.roadsense.driver;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;

@CapacitorPlugin(name = "OnnxDetector")
public class OnnxDetectorPlugin extends Plugin {
    private static final String TAG = "OnnxDetectorPlugin";
    private static final String ASSET_MODEL_PATH = "public/models/pothole_detector_v11n_custom.onnx";
    private static final String FALLBACK_ASSET_MODEL_PATH = "public/models/pothole_detector.onnx";
    private static final int INPUT_SIZE = 640;
    private static final int PLANE_SIZE = INPUT_SIZE * INPUT_SIZE;

    private static final String[] CLASS_NAMES_1 = { "Pothole" };
    private static final String[] CLASS_NAMES_3 = { "Drain Hole", "Pothole", "Sewer Cover" };
    private static final String[] CLASS_NAMES_4 = { "pothole", "longitudinal_crack", "alligator_crack", "rutting" };

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final float[] stagingTensor = new float[3 * PLANE_SIZE];
    private float[] outputStaging = new float[8 * 8400];
    private final int[] pixelBuffer = new int[PLANE_SIZE];
    private final FloatBuffer directFloatBuffer = ByteBuffer
            .allocateDirect(3 * PLANE_SIZE * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer();

    private OrtEnvironment env;
    private OrtSession session;
    private String inputName = "images";
    private String activeModelName = "YOLO11n Edge AI";
    private String activeProvider = "initializing";
    private boolean isInitializing = false;

    @Override
    public void load() {
        super.load();
        executor.execute(this::ensureSessionInitialized);
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        executor.execute(() -> {
            try {
                if (session != null) {
                    session.close();
                    session = null;
                }
            } catch (Exception ignored) {
            }
        });
        executor.shutdown();
    }

    private File copyAssetModelToFiles(String assetPath, String targetFilename) throws Exception {
        Context ctx = getContext();
        File outFile = new File(ctx.getFilesDir(), targetFilename);

        try (InputStream in = ctx.getAssets().open(assetPath)) {
            long assetSize = in.available();
            if (outFile.exists() && assetSize > 0 && outFile.length() == assetSize) {
                return outFile;
            }
            try (FileOutputStream out = new FileOutputStream(outFile)) {
                byte[] buf = new byte[65536];
                int len;
                while ((len = in.read(buf)) != -1) {
                    out.write(buf, 0, len);
                }
                out.flush();
            }
        }
        return outFile;
    }

    private OrtSession buildSession(String modelFilePath, String providerMode) throws Exception {
        OrtSession.SessionOptions opts = new OrtSession.SessionOptions();
        opts.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);
        int threads = Math.min(4, Math.max(2, Runtime.getRuntime().availableProcessors()));
        if ("nnapi".equals(providerMode)) {
            opts.setIntraOpNumThreads(threads);
            opts.addNnapi();
        } else if ("xnnpack".equals(providerMode)) {
            opts.setIntraOpNumThreads(1);
            opts.addConfigEntry("session.intra_op.allow_spinning", "0");
            opts.addXnnpack(Collections.singletonMap("intra_op_num_threads", String.valueOf(threads)));
        } else {
            opts.setIntraOpNumThreads(threads);
        }
        return env.createSession(modelFilePath, opts);
    }

    private long runWarmupPass(OrtSession targetSession, String targetInputName) throws Exception {
        directFloatBuffer.clear();
        directFloatBuffer.put(stagingTensor);
        directFloatBuffer.rewind();
        long t0 = System.nanoTime();
        try (OnnxTensor dummy = OnnxTensor.createTensor(env, directFloatBuffer, new long[]{1, 3, INPUT_SIZE, INPUT_SIZE});
             OrtSession.Result res = targetSession.run(Collections.singletonMap(targetInputName, dummy))) {
            // Warmup done
        }
        return (System.nanoTime() - t0) / 1_000_000L;
    }

    private synchronized boolean ensureSessionInitialized() {
        if (session != null) return true;
        if (isInitializing) return false;
        isInitializing = true;
        try {
            env = OrtEnvironment.getEnvironment();
            File modelFile;
            try {
                modelFile = copyAssetModelToFiles(ASSET_MODEL_PATH, "pothole_detector_v11n_custom.onnx");
                activeModelName = "YOLO11n Edge AI (Native)";
            } catch (Exception primaryMissing) {
                modelFile = copyAssetModelToFiles(FALLBACK_ASSET_MODEL_PATH, "pothole_detector.onnx");
                activeModelName = "YOLO11m Edge AI (Native)";
            }

            String modelPath = modelFile.getAbsolutePath();
            // Native ARM64 NEON multi-core MLAS (benchmarked 2-3x faster than XNNPACK/NNAPI on Snapdragon mobile CPUs)
            OrtSession candidate = buildSession(modelPath, "cpu");
            String candidateInput = candidate.getInputNames().iterator().next();
            long warmMs = runWarmupPass(candidate, candidateInput);
            String providerLabel = "Native ARM64 (" + warmMs + "ms warmup)";
            Log.i(TAG, "ARM64 MLAS warmup: " + warmMs + "ms");

            session = candidate;
            inputName = session.getInputNames().iterator().next();
            activeProvider = providerLabel;
            Log.i(TAG, "ONNX Native Ready: " + activeModelName + " via " + activeProvider);
            return true;
        } catch (Throwable e) {
            Log.e(TAG, "Native ONNX init failed", e);
            activeProvider = "error: " + e.getMessage();
            return false;
        } finally {
            isInitializing = false;
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        executor.execute(() -> {
            boolean ready = session != null || ensureSessionInitialized();
            JSObject res = new JSObject();
            res.put("ready", ready);
            res.put("modelName", activeModelName);
            res.put("provider", activeProvider);
            call.resolve(res);
        });
    }

    @PluginMethod
    public void detectFrame(PluginCall call) {
        final String imageBase64 = call.getString("imageBase64", "");
        final int origW = call.getInt("origWidth", INPUT_SIZE);
        final int origH = call.getInt("origHeight", INPUT_SIZE);
        final double scale = call.getDouble("scale", 1.0);
        final int padX = call.getInt("padX", 0);
        final int padY = call.getInt("padY", 0);
        final double confThreshold = call.getDouble("confThreshold", 0.35);

        if (imageBase64 == null || imageBase64.isEmpty()) {
            call.reject("Empty image payload");
            return;
        }

        executor.execute(() -> {
            long startNs = System.nanoTime();
            try {
                if (!ensureSessionInitialized()) {
                    JSObject empty = new JSObject();
                    empty.put("detections", new JSArray());
                    empty.put("latencyMs", 0);
                    empty.put("ready", false);
                    empty.put("provider", activeProvider);
                    call.resolve(empty);
                    return;
                }

                byte[] jpegBytes = Base64.decode(imageBase64, Base64.DEFAULT);
                Bitmap bmp = BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.length);
                if (bmp == null) {
                    call.reject("Failed to decode JPEG frame");
                    return;
                }

                Bitmap scaledBmp = bmp;
                if (bmp.getWidth() != INPUT_SIZE || bmp.getHeight() != INPUT_SIZE) {
                    scaledBmp = Bitmap.createScaledBitmap(bmp, INPUT_SIZE, INPUT_SIZE, false);
                    bmp.recycle();
                }

                scaledBmp.getPixels(pixelBuffer, 0, INPUT_SIZE, 0, 0, INPUT_SIZE, INPUT_SIZE);
                scaledBmp.recycle();

                // Pack RGB planar float32 normalized to [0, 1]
                final int plane2 = 2 * PLANE_SIZE;
                for (int i = 0; i < PLANE_SIZE; i++) {
                    int px = pixelBuffer[i];
                    stagingTensor[i] = ((px >> 16) & 0xFF) * (1.0f / 255.0f);
                    stagingTensor[PLANE_SIZE + i] = ((px >> 8) & 0xFF) * (1.0f / 255.0f);
                    stagingTensor[plane2 + i] = (px & 0xFF) * (1.0f / 255.0f);
                }

                directFloatBuffer.clear();
                directFloatBuffer.put(stagingTensor);
                directFloatBuffer.rewind();

                JSArray detArray;
                try (OnnxTensor inputTensor = OnnxTensor.createTensor(
                        env, directFloatBuffer, new long[]{1, 3, INPUT_SIZE, INPUT_SIZE});
                     OrtSession.Result result = session.run(Collections.singletonMap(inputName, inputTensor))) {

                    OnnxTensor outputTensor = (OnnxTensor) result.get(0);
                    long[] shape = outputTensor.getInfo().getShape();
                    int channels = (int) shape[1];
                    int anchors = (int) shape[2];
                    FloatBuffer outBuf = outputTensor.getFloatBuffer();

                    detArray = postprocess(outBuf, channels, anchors, origW, origH, scale, padX, padY, confThreshold);
                }

                long latencyMs = Math.max(1L, (System.nanoTime() - startNs) / 1_000_000L);
                JSObject response = new JSObject();
                response.put("detections", detArray);
                response.put("latencyMs", latencyMs);
                response.put("ready", true);
                response.put("modelName", activeModelName);
                response.put("provider", activeProvider);
                call.resolve(response);
            } catch (Throwable err) {
                Log.e(TAG, "Detection error", err);
                call.reject("Detection failed: " + err.getMessage());
            }
        });
    }

    private static class Candidate {
        float x, y, w, h, conf, bottomY, areaRatio;
        int classIdx;
    }

    private JSArray postprocess(
            FloatBuffer buf,
            int channels,
            int anchors,
            int origW,
            int origH,
            double scale,
            int padX,
            int padY,
            double confThreshold
    ) {
        int total = channels * anchors;
        if (outputStaging.length < total) {
            outputStaging = new float[total];
        }
        buf.rewind();
        buf.get(outputStaging, 0, total);
        final float[] data = outputStaging;

        int numClasses = channels - 4;
        List<Candidate> candidates = new ArrayList<>();
        float thresh = (float) confThreshold;
        double safeScale = scale > 0.0 ? scale : 1.0;

        for (int i = 0; i < anchors; i++) {
            float maxScore = -1f;
            int bestClass = -1;
            for (int c = 0; c < numClasses; c++) {
                float score = data[(4 + c) * anchors + i];
                if (score > maxScore) {
                    maxScore = score;
                    bestClass = c;
                }
            }

            if (maxScore >= thresh) {
                float xc = data[i];
                float yc = data[anchors + i];
                float w = data[2 * anchors + i];
                float h = data[3 * anchors + i];

                float origX = (float) Math.max(0.0, (xc - w / 2.0f - padX) / safeScale);
                float origY = (float) Math.max(0.0, (yc - h / 2.0f - padY) / safeScale);
                float origBoxW = (float) Math.min(origW - origX, w / safeScale);
                float origBoxH = (float) Math.min(origH - origY, h / safeScale);

                if (origBoxW > 5f && origBoxH > 5f) {
                    Candidate cand = new Candidate();
                    cand.x = origX;
                    cand.y = origY;
                    cand.w = origBoxW;
                    cand.h = origBoxH;
                    cand.conf = maxScore;
                    cand.classIdx = bestClass;
                    cand.bottomY = Math.min(1.0f, (origY + origBoxH) / Math.max(1f, (float) origH));
                    cand.areaRatio = (origBoxW * origBoxH) / Math.max(1f, (float) (origW * origH));
                    candidates.add(cand);
                }
            }
        }

        Collections.sort(candidates, new Comparator<Candidate>() {
            @Override
            public int compare(Candidate a, Candidate b) {
                return Float.compare(b.conf, a.conf);
            }
        });

        List<Candidate> kept = new ArrayList<>();
        for (Candidate cand : candidates) {
            boolean suppressed = false;
            for (Candidate existing : kept) {
                if (computeIoU(cand, existing) > 0.45f) {
                    suppressed = true;
                    break;
                }
            }
            if (!suppressed) {
                kept.add(cand);
                if (kept.size() >= 10) break;
            }
        }

        JSArray outArray = new JSArray();
        String[] classMap = numClasses == 1 ? CLASS_NAMES_1 : numClasses == 3 ? CLASS_NAMES_3 : CLASS_NAMES_4;
        for (Candidate item : kept) {
            double dist = estimateDistance(item.bottomY);
            double normW = item.w / (double) Math.max(1, origW);
            double normH = item.h / (double) Math.max(1, origH);
            double distFactor = dist > 12.0 ? Math.pow(12.0 / dist, 0.65) : 1.0;
            double widthMeters = Math.max(0.15, Math.min(1.4, normW * dist * 1.15 * distFactor));
            double lengthMeters = Math.max(0.15, Math.min(1.4, normH * dist * 1.25 * distFactor));
            int widthCm = (int) Math.round(widthMeters * 100.0);
            int lengthCm = (int) Math.round(lengthMeters * 100.0);
            double areaM2 = Math.round(Math.min(2.5, Math.max(0.03, (Math.PI / 4.0) * widthMeters * lengthMeters)) * 100.0) / 100.0;
            double effDiameterCm = Math.sqrt(widthCm * lengthCm);

            String className = (item.classIdx >= 0 && item.classIdx < classMap.length)
                    ? classMap[item.classIdx]
                    : "hazard_" + item.classIdx;
            boolean isPothole = className.toLowerCase().contains("pothole");
            boolean isRutting = className.toLowerCase().contains("rutting");

            double rawDepthCm;
            if (isPothole) {
                double cavityFactor = 0.85 + 0.25 * Math.min(1.0, Math.max(0.3, (double) item.conf));
                rawDepthCm = 0.085 * effDiameterCm * cavityFactor;
                rawDepthCm = Math.min(14.0, Math.max(1.8, rawDepthCm));
            } else if (isRutting) {
                rawDepthCm = Math.min(5.5, Math.max(1.2, 0.050 * effDiameterCm));
            } else {
                rawDepthCm = Math.min(3.0, Math.max(0.6, 0.030 * effDiameterCm));
            }
            double depthCm = Math.round(rawDepthCm * 10.0) / 10.0;

            String riskFactor = "LOW";
            if (depthCm >= 5.0 || areaM2 >= 0.35 || (depthCm >= 4.0 && areaM2 >= 0.20)) {
                riskFactor = "HIGH";
            } else if (depthCm >= 2.8 || areaM2 >= 0.12) {
                riskFactor = "MEDIUM";
            }

            double baseScore = 0.45 * Math.min(1.0, item.areaRatio * 25.0) * 100.0 + 0.35 * (item.bottomY * 100.0) + 0.20 * (item.conf * 100.0);
            double depthFactor = 0.85 + 0.25 * Math.min(1.0, Math.max(0.0, (depthCm - 2.0) / 6.0));
            int score = (int) Math.min(100, Math.max(0, Math.round(baseScore * depthFactor)));
            String severity = "HIGH".equals(riskFactor) || score >= 70 ? "critical" : "MEDIUM".equals(riskFactor) || score >= 40 ? "medium" : "low";

            JSObject boxObj = new JSObject();
            boxObj.put("x", Math.round(item.x));
            boxObj.put("y", Math.round(item.y));
            boxObj.put("width", Math.round(item.w));
            boxObj.put("height", Math.round(item.h));

            JSObject detObj = new JSObject();
            detObj.put("class", className);
            detObj.put("classIndex", item.classIdx);
            detObj.put("confidence", Math.round(item.conf * 100.0) / 100.0);
            detObj.put("box", boxObj);
            detObj.put("severity", severity);
            detObj.put("severityScore", score);
            detObj.put("estimatedDistanceMeters", dist);
            detObj.put("estimatedAreaM2", areaM2);
            detObj.put("estimatedDepthCm", depthCm);
            detObj.put("widthCm", widthCm);
            detObj.put("lengthCm", lengthCm);
            detObj.put("riskFactor", riskFactor);
            outArray.put(detObj);
        }
        return outArray;
    }

    private float computeIoU(Candidate b1, Candidate b2) {
        float x1 = Math.max(b1.x, b2.x);
        float y1 = Math.max(b1.y, b2.y);
        float x2 = Math.min(b1.x + b1.w, b2.x + b2.w);
        float y2 = Math.min(b1.y + b1.h, b2.y + b2.h);
        float intersection = Math.max(0f, x2 - x1) * Math.max(0f, y2 - y1);
        float union = b1.w * b1.h + b2.w * b2.h - intersection;
        return union > 0f ? intersection / union : 0f;
    }

    private double estimateDistance(float bottomNormalizedY) {
        double tiltRad = Math.toRadians(12.0);
        double fovYRad = Math.toRadians(55.0);
        double focalY = 0.5 / Math.tan(fovYRad / 2.0);
        double deltaY = bottomNormalizedY - 0.5;
        double angleBelowCenter = Math.atan2(deltaY, focalY);
        double totalAngle = tiltRad + angleBelowCenter;
        if (totalAngle <= 0.04) return 60.0;
        double dist = 1.35 / Math.tan(totalAngle);
        return Math.min(60.0, Math.max(1.5, Math.round(dist * 10.0) / 10.0));
    }
}
