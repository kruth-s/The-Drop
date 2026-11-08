import React from 'react';
import { X, CheckCircle2, Sparkles, Scan, Sliders, Shield } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <span className="text-white font-bold text-sm">1</span>,
      title: "Paste AI-Generated Text",
      description: "Paste text generated from ChatGPT, Claude, Gemini, or any other LLM into the input editor."
    },
    {
      icon: <Sliders className="w-4 h-4 text-white" />,
      title: "Select Humanizer Level & Model",
      description: "Choose your level (1 to 10). Level 8 is the sweet spot for heavy rewrite with maximum sentence variation to bypass strict detectors."
    },
    {
      icon: <Sparkles className="w-4 h-4 text-white" />,
      title: "Click 'Humanize'",
      description: "Our proprietary Ghost algorithm restructures perplexity, burstiness, and syntax rhythms while preserving original meaning."
    },
    {
      icon: <Scan className="w-4 h-4 text-white" />,
      title: "Verify with 'Check for AI'",
      description: "Run an instant multi-engine check across Turnitin, GPTZero, CopyLeaks, and Sapling to ensure a 100% human score."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-[#14151a] border border-[#262733] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22232e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-neutral-200" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">How to Use TextEnd</h2>
              <p className="text-xs text-neutral-400">Step-by-step guide to achieving 100% undetectable human text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-[#181922] border border-[#242533]">
              <div className="w-8 h-8 rounded-lg bg-[#272836] flex items-center justify-center flex-shrink-0 text-white font-semibold">
                {step.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">{step.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips footer */}
        <div className="px-6 py-4 bg-[#111216] border-t border-[#20212b] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Works seamlessly against Turnitin, GPTZero & Originality.ai</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

