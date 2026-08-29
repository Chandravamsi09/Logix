import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 ml-64 p-8">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
};
