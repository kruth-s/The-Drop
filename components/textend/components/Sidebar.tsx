import React from 'react';
import {
  LayoutDashboard,
  PenLine,
  Scan,
  User,
  FileText,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Gift,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TextEndLogo } from './icons/TextEndLogo';
import { NavItem } from '../types';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onGoToHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  onGoToHome
}) => {
  return (
    <aside
      className={`relative flex flex-col bg-[#0e0f11] border-r border-[#1e1f26] select-none transition-all duration-300 ease-in-out z-30 ${
        collapsed ? 'w-[70px]' : 'w-[240px]'
      }`}
    >
      {/* Brand Header */}
      <div
        onClick={onGoToHome}
        className="h-[62px] px-5 flex items-center justify-between border-b border-[#1a1b22] cursor-pointer hover:bg-[#14151b] transition-colors group"
        title="Go to Home"
      >
        <TextEndLogo iconOnly={collapsed} />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {/* Standalone Dashboard */}
        <div>
          <button
            onClick={() => setActiveTab('Dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === 'Dashboard'
                ? 'bg-[#22232a] text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0 text-neutral-300" />
            {!collapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* Tools Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
              Tools
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('Humanizer')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'Humanizer'
                  ? 'bg-[#22232a] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="Humanizer"
            >
              <PenLine className="w-[18px] h-[18px] flex-shrink-0 text-neutral-300" />
              {!collapsed && <span>Humanizer</span>}
            </button>

            <button
              onClick={() => setActiveTab('AI Detector')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'AI Detector'
                  ? 'bg-[#22232a] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="AI Detector"
            >
              <Scan className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>AI Detector</span>}
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
              Account
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('Account')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'Account'
                  ? 'bg-[#22232a] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="Account"
            >
              <User className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>Account</span>}
            </button>

            <button
              onClick={() => setActiveTab('Billing')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'Billing'
                  ? 'bg-[#22232a] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="Billing"
            >
              <FileText className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>Billing</span>}
            </button>

            <button
              onClick={() => setActiveTab('Plans & Pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'Plans & Pricing'
                  ? 'bg-[#22232a] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="Plans & Pricing"
            >
              <CreditCard className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>Plans & Pricing</span>}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
              Help
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('FAQ')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'FAQ'
                  ? 'bg-[#22232a] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="FAQ"
            >
              <HelpCircle className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>FAQ</span>}
            </button>

            <button
              onClick={() => setActiveTab('Support')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'Support'
                  ? 'bg-[#22232a] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="Support"
            >
              <MessageCircle className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>Support</span>}
            </button>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d] transition-colors"
              title="Discord"
            >
              {/* Discord SVG */}
              <svg className="w-[18px] h-[18px] flex-shrink-0 fill-neutral-400" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              {!collapsed && <span>Discord</span>}
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
              Links
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('Refer & Earn')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === 'Refer & Earn'
                  ? 'bg-[#22232a] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16171d]'
              }`}
              title="Refer & Earn"
            >
              <Gift className="w-[18px] h-[18px] flex-shrink-0 text-neutral-400" />
              {!collapsed && <span>Refer & Earn</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Collapse/Expand circular chevron button positioned on right border */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#181920] border border-[#2b2d38] text-neutral-400 hover:text-white hover:bg-[#252733] flex items-center justify-center transition-all shadow-md z-40 focus:outline-none"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
};

