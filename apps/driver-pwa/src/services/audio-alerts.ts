/**
 * RoadSense AI - Audio and Speech Warning Engine
 * Features:
 * - Synthesized warning chime using Web Audio API (zero external asset dependencies)
 * - Multi-language voice announcements via Web Speech API (English, Kannada, Hindi)
 * - Cooldown / debouncing so driver is never overwhelmed
 */

export type AlertLanguage = 'en' | 'kn' | 'hi';

class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private lastAlertTime = 0;
  private lastAlertId = '';
  private isMuted = false;
  private language: AlertLanguage = 'en';

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setLanguage(lang: AlertLanguage) {
    this.language = lang;
  }

  public getLanguage(): AlertLanguage {
    return this.language;
  }

  /**
   * Synthesizes an alert chime based on hazard severity
   */
  public playChime(severity: 'low' | 'medium' | 'critical' = 'medium') {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = severity === 'critical' ? 'sawtooth' : 'sine';

      // Critical: High-pitched urgent double beep; Medium: Smooth alert chime
      const freq = severity === 'critical' ? 880 : 587; // A5 vs D5
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (severity === 'critical') {
        osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.1); // D6
      }

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  /**
   * Speaks a safety alert in English, Kannada, or Hindi
   */
  public speakAlert(
    hazardClass: string,
    distanceMeters: number,
    severity: 'low' | 'medium' | 'critical',
    hazardId?: string
  ) {
    if (this.isMuted) return;

    const now = Date.now();
    // Debounce alerts: minimum 4 seconds between voice warnings unless critical new hazard
    if (hazardId && hazardId === this.lastAlertId && now - this.lastAlertTime < 6000) {
      return;
    }
    if (now - this.lastAlertTime < 3500) {
      return;
    }

    this.lastAlertTime = now;
    if (hazardId) this.lastAlertId = hazardId;

    // Play immediate chime first
    this.playChime(severity);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const distRounded = Math.round(distanceMeters);

    let phrase = '';
    let langCode = 'en-US';

    if (this.language === 'kn') {
      langCode = 'kn-IN';
      phrase = `ಎಚ್ಚರಿಕೆ! ${distRounded} ಮೀಟರ್ ದೂರದಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿ ಇದೆ.`;
    } else if (this.language === 'hi') {
      langCode = 'hi-IN';
      phrase = `सावधान! ${distRounded} मीटर आगे गड्ढा है.`;
    } else {
      langCode = 'en-US';
      const label = hazardClass.includes('crack') ? 'crack' : 'pothole';
      phrase = `Caution! ${label} ahead, ${distRounded} meters.`;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any lingering speech
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = langCode;
      utterance.rate = 1.05; // Slightly faster for urgent safety cue
      utterance.volume = 0.9;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
}

export const audioAlertService = new AudioAlertService();
