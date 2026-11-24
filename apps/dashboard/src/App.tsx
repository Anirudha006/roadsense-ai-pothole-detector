import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewView } from './components/overview/OverviewView';
import { LiveHazardMap } from './components/map/LiveHazardMap';
import { AreaDistributionView } from './components/analytics/AreaDistributionView';
import { AIModelTrainingView } from './components/training/AIModelTrainingView';
import { TicketKanbanBoard } from './components/kanban/TicketKanbanBoard';
import { SettingsView } from './components/settings/SettingsView';
import { useHazards } from './context/HazardContext';

export const App: React.FC = () => {
  const { activeTab } = useHazards();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4FBFA]">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'map' && <LiveHazardMap />}
          {activeTab === 'area-distribution' && <AreaDistributionView />}
          {activeTab === 'training' && <AIModelTrainingView />}
          {activeTab === 'kanban' && <TicketKanbanBoard />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
