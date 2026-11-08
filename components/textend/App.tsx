'use client';

import React, { useState } from 'react';
import { Home, AppView } from './components/Home';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Humanizer } from './components/Humanizer';
import { AIDetectorView } from './components/AIDetectorView';
import { DashboardView } from './components/DashboardView';
import { PlansPricingView } from './components/PlansPricingView';
import { SummarizePage } from './components/SummarizePage';
import { ParaphraserView } from './components/ParaphraserView';
import { PlagiarismCheckerView } from './components/PlagiarismCheckerView';
import { TextExtractorView } from './components/TextExtractorView';
import { ElaboratorView } from './components/ElaboratorView';
import { NavItem } from './types';

export function App() {
  const [view, setView] = useState<AppView | 'home'>('home');
  const [activeTab, setActiveTab] = useState<NavItem>('Humanizer');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  // View 1: Home Landing Page with 5 Containers
  if (view === 'home') {
    return <Home onSelectView={(selected) => setView(selected)} />;
  }

  // View 2: QuillBot Clone Frontend (Summarizer)
  if (view === 'summarize') {
    return (
      <SummarizePage
        onBackToHome={() => setView('home')}
        onGoToHumanizer={() => setView('humanize')}
      />
    );
  }

  // View 3: Paraphraser View
  if (view === 'paraphraser') {
    return <ParaphraserView onBackToHome={() => setView('home')} />;
  }

  // View 4: Plagiarism Checker View
  if (view === 'plagiarism') {
    return <PlagiarismCheckerView onBackToHome={() => setView('home')} />;
  }

  // View 5: Text Extractor View
  if (view === 'extractor') {
    return (
      <TextExtractorView
        onBackToHome={() => setView('home')}
        onSendToHumanizer={() => setView('humanize')}
        onSendToSummarizer={() => setView('summarize')}
      />
    );
  }

  // View 6: Elaborator View
  if (view === 'elaborator') {
    return (
      <ElaboratorView
        onBackToHome={() => setView('home')}
        onSendToHumanizer={() => setView('humanize')}
      />
    );
  }

  // View 7: TextEnd Humanizer & Workspace Frontend
  return (
    <div className={`min-h-screen flex bg-[#0c0d0f] text-neutral-100 ${darkMode ? 'dark' : ''}`}>
      {/* TextEnd Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onGoToHome={() => setView('home')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header with Breadcrumbs */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === 'Humanizer' && <Humanizer />}
          {activeTab === 'AI Detector' && <AIDetectorView />}
          {activeTab === 'Dashboard' && (
            <DashboardView onGoToHumanizer={() => setActiveTab('Humanizer')} />
          )}
          {activeTab === 'Plans & Pricing' && <PlansPricingView />}
          {activeTab !== 'Humanizer' &&
            activeTab !== 'AI Detector' &&
            activeTab !== 'Dashboard' &&
            activeTab !== 'Plans & Pricing' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
                <div className="p-4 rounded-2xl bg-[#141519] border border-[#22232c] max-w-md">
                  <h2 className="text-lg font-semibold text-white mb-2">{activeTab}</h2>
                  <p className="text-xs text-neutral-400 mb-4">
                    This section is configured for your TextEnd workspace.
                  </p>
                  <button
                    onClick={() => setActiveTab('Humanizer')}
                    className="px-4 py-2 bg-white text-neutral-900 font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Back to Humanizer
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

export default App;
