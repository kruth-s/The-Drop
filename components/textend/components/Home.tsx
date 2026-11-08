import React from 'react';
import { PenLine, FileText, RefreshCw, FileCheck, ScanText, Maximize2 } from 'lucide-react';

export type AppView = 'humanize' | 'summarize' | 'paraphraser' | 'plagiarism' | 'extractor' | 'elaborator';

interface HomeProps {
  onSelectView: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectView }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0d0f] text-neutral-100 p-6 sm:p-10 selection:bg-neutral-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* 1. Humanizer Container - Indigo Hover */}
        <button
          onClick={() => onSelectView('humanize')}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[#131417] rounded-2xl border border-[#22232c] hover:border-indigo-500/60 hover:bg-[#161722] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer shadow-xl group text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#1b1c24] border border-transparent group-hover:border-indigo-500/30 group-hover:bg-indigo-500/15 flex items-center justify-center text-neutral-300 group-hover:text-indigo-400 group-hover:scale-105 transition-all duration-300">
            <PenLine className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors duration-300">
            Humanizer
          </h2>
        </button>

        {/* 2. Summarizer Container - Emerald Hover */}
        <button
          onClick={() => onSelectView('summarize')}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[#131417] rounded-2xl border border-[#22232c] hover:border-emerald-500/60 hover:bg-[#141d1a] hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer shadow-xl group text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#1b1c24] border border-transparent group-hover:border-emerald-500/30 group-hover:bg-emerald-500/15 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 group-hover:scale-105 transition-all duration-300">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors duration-300">
            Summarizer
          </h2>
        </button>

        {/* 3. Paraphraser Container - Cyan Hover */}
        <button
          onClick={() => onSelectView('paraphraser')}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[#131417] rounded-2xl border border-[#22232c] hover:border-cyan-500/60 hover:bg-[#131a22] hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer shadow-xl group text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#1b1c24] border border-transparent group-hover:border-cyan-500/30 group-hover:bg-cyan-500/15 flex items-center justify-center text-neutral-300 group-hover:text-cyan-400 group-hover:scale-105 transition-all duration-300">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors duration-300">
            Paraphraser
          </h2>
        </button>

        {/* 4. Plagiarism Checker Container - Rose Hover */}
        <button
          onClick={() => onSelectView('plagiarism')}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[#131417] rounded-2xl border border-[#22232c] hover:border-rose-500/60 hover:bg-[#1e151a] hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer shadow-xl group text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#1b1c24] border border-transparent group-hover:border-rose-500/30 group-hover:bg-rose-500/15 flex items-center justify-center text-neutral-300 group-hover:text-rose-400 group-hover:scale-105 transition-all duration-300">
            <FileCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-rose-300 transition-colors duration-300">
            Plagiarism Checker
          </h2>
        </button>

        {/* 5. Text Extractor Container - Amber Hover */}
        <button
          onClick={() => onSelectView('extractor')}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[#131417] rounded-2xl border border-[#22232c] hover:border-amber-500/60 hover:bg-[#1d1912] hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer shadow-xl group text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#1b1c24] border border-transparent group-hover:border-amber-500/30 group-hover:bg-amber-500/15 flex items-center justify-center text-neutral-300 group-hover:text-amber-400 group-hover:scale-105 transition-all duration-300">
            <ScanText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors duration-300">
            Text Extractor
          </h2>
        </button>

        {/* 6. Elaborator Container - Fuchsia Hover */}
        <button
          onClick={() => onSelectView('elaborator')}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[#131417] rounded-2xl border border-[#22232c] hover:border-fuchsia-500/60 hover:bg-[#1d1322] hover:shadow-2xl hover:shadow-fuchsia-500/10 transition-all duration-300 cursor-pointer shadow-xl group text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#1b1c24] border border-transparent group-hover:border-fuchsia-500/30 group-hover:bg-fuchsia-500/15 flex items-center justify-center text-neutral-300 group-hover:text-fuchsia-400 group-hover:scale-105 transition-all duration-300">
            <Maximize2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-fuchsia-300 transition-colors duration-300">
            Elaborator
          </h2>
        </button>
      </div>
    </div>
  );
};
