import React from 'react';
import { Sliders, X, Sparkles, Check, HelpCircle } from 'lucide-react';
import { AdvancedSettings } from '../types';

interface AdvancedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdvancedSettings;
  setSettings: React.Dispatch<React.SetStateAction<AdvancedSettings>>;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings
}) => {
  if (!isOpen) return null;

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
              <Sliders className="w-4 h-4 text-neutral-200" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Advanced Settings</h2>
              <p className="text-xs text-neutral-400">Fine-tune tone, detectors, and word freezing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Target Detector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Primary Detector Target
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['All Major Detectors', 'Turnitin', 'GPTZero', 'Originality.ai', 'CopyLeaks'] as const).map(
                (target) => (
                  <button
                    key={target}
                    onClick={() => setSettings(prev => ({ ...prev, bypassTarget: target }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                      settings.bypassTarget === target
                        ? 'bg-[#252735] text-white border-neutral-400 shadow-sm'
                        : 'bg-[#181922] text-neutral-400 border-[#252636] hover:text-neutral-200 hover:bg-[#1e202b]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{target}</span>
                      {settings.bypassTarget === target && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Tone of Voice
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Standard', 'Academic', 'Professional', 'Conversational', 'Creative'] as const).map(
                (tone) => (
                  <button
                    key={tone}
                    onClick={() => setSettings(prev => ({ ...prev, targetTone: tone }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all border ${
                      settings.targetTone === tone
                        ? 'bg-[#252735] text-white border-neutral-400'
                        : 'bg-[#181922] text-neutral-400 border-[#252636] hover:text-neutral-200 hover:bg-[#1e202b]'
                    }`}
                  >
                    {tone}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sentence Variation */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Sentence Rhythm & Variation (Burstiness)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Balanced', 'High', 'Maximum'] as const).map((variation) => (
                <button
                  key={variation}
                  onClick={() => setSettings(prev => ({ ...prev, sentenceVariation: variation }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all border ${
                    settings.sentenceVariation === variation
                      ? 'bg-[#252735] text-white border-neutral-400'
                      : 'bg-[#181922] text-neutral-400 border-[#252636] hover:text-neutral-200 hover:bg-[#1e202b]'
                  }`}
                >
                  {variation}
                </button>
              ))}
            </div>
          </div>

          {/* Freeze Keywords */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Freeze Words / Protected Terms</span>
                <span title="Words that will never be changed or substituted">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                </span>
              </label>
              <span className="text-[11px] text-neutral-500">Comma separated</span>
            </div>
            <input
              type="text"
              placeholder="e.g. quantum computing, NASA, John Doe, PyTorch"
              value={settings.preserveKeywords}
              onChange={(e) => setSettings(prev => ({ ...prev, preserveKeywords: e.target.value }))}
              className="w-full bg-[#181922] border border-[#262736] rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {/* Groq Engine Note */}
          <div className="p-3 bg-[#181923] border border-[#26283b] rounded-xl flex items-center justify-between text-xs text-neutral-300">
            <div>
              <span className="font-semibold text-white block">Groq Cloud Inference</span>
              <span className="text-[11px] text-neutral-400">Configure your Groq key via the top bar for Llama 3.3 70B</span>
            </div>
            <span className="text-[11px] px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              Fast LPU
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111216] border-t border-[#20212b] flex items-center justify-between">
          <button
            onClick={() => {
              setSettings({
                preserveKeywords: '',
                targetTone: 'Standard',
                bypassTarget: 'All Major Detectors',
                readabilityLevel: 'College',
                sentenceVariation: 'Maximum'
              });
            }}
            className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg transition-colors"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
