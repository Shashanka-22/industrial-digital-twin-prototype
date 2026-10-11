/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { Header } from './components/common/Header';
import { Sidebar, PageId } from './components/common/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { AlarmCenterPage } from './pages/AlarmCenterPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { VirtualCommissioningPage } from './pages/VirtualCommissioningPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Footer } from './components/common/Footer';
import { Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header onNavigateToAlarms={() => setActivePage('alarms')} />

      {/* Mobile Menu Button Floating Bar */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-4 h-4 text-teal-600" />
          <span>Navigation Menu</span>
        </button>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          {activePage.replace('_', ' ')}
        </span>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={(page) => setActivePage(page)}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activePage === 'overview' && <OverviewPage onNavigate={setActivePage} />}
          {activePage === 'digital_twin' && <DigitalTwinPage />}
          {activePage === 'telemetry' && <TelemetryPage />}
          {activePage === 'predictive_maint' && <PredictiveMaintenancePage />}
          {activePage === 'alarms' && <AlarmCenterPage />}
          {activePage === 'architecture' && <ArchitecturePage />}
          {activePage === 'virtual_commissioning' && <VirtualCommissioningPage />}
          {activePage === 'analytics' && <AnalyticsPage />}
          {activePage === 'settings' && <SettingsPage />}

          {/* Independent Project Notice Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
