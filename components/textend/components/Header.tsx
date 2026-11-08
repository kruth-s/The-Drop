import React from 'react';
import {
  PanelLeft,
  ChevronRight,
  ChevronsUpDown,
  Moon,
  Sun
} from 'lucide-react';
import { NavItem } from '../types';

interface HeaderProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  toggleSidebar: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  toggleSidebar,
  darkMode,
  setDarkMode
}) => {
  return (
    <header className="h-[62px] px-6 border-b border-[#1b1c24] flex items-center justify-between bg-[#0c0d10] select-none sticky top-0 z-20">
      {/* Left: Collapse toggle + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-neutral-400 hover:text-white p-1.5 rounded-md hover:bg-[#1c1d25] transition-colors"
          title="Toggle Sidebar"
        >
          {/* Panel left icon */}
          <PanelLeft className="w-[18px] h-[18px]" />
        </button>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setActiveTab('Dashboard')}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Dashboard
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-white font-medium">
            {activeTab}
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-[#1c1d25] transition-colors"
          title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {darkMode ? (
            <Moon className="w-[18px] h-[18px]" />
          ) : (
            <Sun className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
    </header>
  );
};

