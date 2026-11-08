import React, { useState } from 'react';
import {
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { elaborateText } from '../services/elaboratorService';
import { TextEndLogo } from './icons/TextEndLogo';

interface ElaboratorViewProps {
  onBackToHome: () => void;
  onSendToHumanizer?: (text: string) => void;
}

const SAMPLE_TEXT = `Electric vehicles reduce carbon emissions compared to traditional combustion engines. Improving battery recycling and charging infrastructure will accelerate widespread adoption.`;

export const ElaboratorView: React.FC<ElaboratorViewProps> = ({
  onBackToHome,
  onSendToHumanizer
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [depth, setDepth] = useState<'Balanced' | 'In-Depth' | 'Comprehensive'>('In-Depth');
  const [tone, setTone] = useState<'Professional' | 'Academic' | 'Creative' | 'Conversational'>('Professional');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usedModel, setUsedModel] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
  const growth = wordCount > 0 && outputWordCount > 0
    ? Math.round(((outputWordCount - wordCount) / wordCount) * 100)
    : 0;

  const handleElaborate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await elaborateText(inputText, { depth, tone });
      setOutputText(res.elaborated);
      setUsedModel(res.usedModel);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0f] text-neutral-100 font-sans">
      {/* Top Header */}
      <header className="h-[58px] bg-[#101115] border-b border-[#1d1e26] px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <TextEndLogo
            onClick={onBackToHome}
            isDark={true}
            accentColor="text-fuchsia-400"
          />
          <span className="text-xs px-2 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
            Elaborator
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 inline-block animate-pulse"></span>
          <span>Groq Reasoning</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex flex-col items-center">
        <div className="text-center mb-6 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Idea & Paragraph Elaborator
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Expand short points, outlines, and brief drafts into detailed, articulate, and well-researched paragraphs.
          </p>
        </div>

        {/* Elaborator Card */}
        <div className="w-full bg-[#131417] border border-[#202127] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Controls Toolbar */}
          <div className="px-5 py-3 border-b border-[#1c1d23] flex flex-wrap items-center justify-between gap-3 bg-[#101115]">
            <div className="flex flex-wrap items-center gap-4">
              {/* Depth Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
                  Depth:
                </span>
                {(['Balanced', 'In-Depth', 'Comprehensive'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      depth === d
                        ? 'bg-fuchsia-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200 bg-[#181920] border border-[#252632]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Tone Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
                  Tone:
                </span>
                {(['Professional', 'Academic', 'Creative', 'Conversational'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      tone === t
                        ? 'bg-[#282a39] text-fuchsia-300 border border-fuchsia-500/40'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setInputText(SAMPLE_TEXT);
                setOutputText('');
              }}
              className="text-xs text-fuchsia-400 hover:underline font-medium"
            >
              Load Sample Idea
            </button>
          </div>

          {/* Split Panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1e202a] min-h-[380px]">
            {/* Input Pane */}
            <div className="p-5 flex flex-col justify-between relative bg-[#131417]">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter a brief idea, bullet point, or short draft to elaborate on..."
                className="w-full flex-1 min-h-[280px] bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none resize-none leading-relaxed"
              />

              <div className="pt-3 border-t border-[#1c1d25] flex items-center justify-between text-xs text-neutral-400">
                <span>{wordCount} words</span>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText('');
                      setOutputText('');
                    }}
                    className="hover:text-neutral-200 text-neutral-500"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Output Pane */}
            <div className="p-5 flex flex-col justify-between bg-[#111215] relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1c1d25]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Elaborated Content
                  </span>
                  {growth > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
                      +{growth}% expansion
                    </span>
                  )}
                  {usedModel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c1d26] text-neutral-400 border border-[#262835]">
                      {usedModel}
                    </span>
                  )}
                </div>

                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white px-2 py-0.5 rounded bg-[#1b1c24] border border-[#272834] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto min-h-[260px] text-sm text-neutral-200 leading-relaxed">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3 py-16">
                    <div className="w-7 h-7 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Elaborating with rich details & context...</span>
                  </div>
                ) : outputText ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{outputText}</div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-16">
                    <Maximize2 className="w-8 h-8 mb-2 opacity-40 text-fuchsia-400" />
                    <p className="text-xs">Your elaborated output will appear here.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1c1d25] flex items-center justify-between text-xs text-neutral-400">
                <span>Output: {outputWordCount} words</span>
                {outputText && onSendToHumanizer && (
                  <button
                    onClick={() => onSendToHumanizer(outputText)}
                    className="flex items-center gap-1 text-indigo-400 hover:underline"
                  >
                    <span>Send to Humanizer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="px-5 py-3.5 bg-[#0f1013] border-t border-[#1c1d23] flex items-center justify-end">
            <button
              onClick={handleElaborate}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-2 px-7 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 cursor-pointer"
            >
              <Maximize2 className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Elaborating...' : 'Elaborate Text'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

