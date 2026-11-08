import React from 'react';
import { LayoutDashboard, Sparkles, FileText, TrendingUp, Check, ArrowUpRight } from 'lucide-react';
import { NavItem } from '../types';

interface DashboardViewProps {
  onGoToHumanizer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onGoToHumanizer }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-neutral-400 mt-1">Here is a summary of your TextEnd account activity.</p>
        </div>
        <button
          onClick={onGoToHumanizer}
          className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
          <span>Launch Humanizer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#141519] border border-[#22232b] rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Words Humanized</span>
            <FileText className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-bold text-white">4,280</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+1,200 this week</span>
          </div>
        </div>

        <div className="bg-[#141519] border border-[#22232b] rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>AI Bypassed Rate</span>
            <Sparkles className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">99.4%</div>
          <div className="text-[11px] text-neutral-400 mt-1">Turnitin, GPTZero, CopyLeaks</div>
        </div>

        <div className="bg-[#141519] border border-[#22232b] rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Daily Free Quota</span>
            <span className="text-[11px] text-neutral-500">Free Plan</span>
          </div>
          <div className="text-2xl font-bold text-white">0 / 1,000</div>
          <div className="text-[11px] text-neutral-400 mt-1">Resets every 24 hours</div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-[#141519] border border-[#22232b] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Humanizations</h2>
        <div className="space-y-3">
          {[
            { title: "Academic essay on sustainable energy", words: 412, date: "Yesterday, 3:45 PM", status: "100% Human" },
            { title: "Product description & feature matrix", words: 185, date: "Nov 4, 11:10 AM", status: "98% Human" },
            { title: "Machine learning research intro", words: 350, date: "Nov 3, 6:20 PM", status: "100% Human" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#181921] border border-[#232431]">
              <div>
                <h3 className="text-xs font-semibold text-neutral-200">{item.title}</h3>
                <span className="text-[11px] text-neutral-400">{item.words} words • {item.date}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

