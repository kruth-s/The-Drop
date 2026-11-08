import React, { useState, useRef } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Clipboard,
  Upload,
  Sparkles,
  Zap
} from 'lucide-react';
import { paraphraseText } from '../services/paraphraserService';
import { TextEndLogo } from './icons/TextEndLogo';

interface ParaphraserViewProps {
  onBackToHome: () => void;
}

const SAMPLE_TEXT = `Modern organizations increasingly depend on artificial intelligence systems to streamline complex business workflows, enhance employee productivity, and unlock actionable data-driven insights. However, successfully integrating these advanced technologies requires thoughtful strategic planning, transparent ethical governance, and continuous human oversight to mitigate potential risks and algorithmic biases.`;

export const ParaphraserView: React.FC<ParaphraserViewProps> = ({ onBackToHome }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [mode, setMode] = useState<'Standard' | 'Fluency' | 'Creative' | 'Formal' | 'Academic'>('Standard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usedModel, setUsedModel] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await paraphraseText(inputText, { mode });
      setOutputText(res.paraphrased);
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

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setInputText(clip);
    } catch (e) {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInputText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0f] text-neutral-100 font-sans">
      {/* Top Header */}
      <header className="h-[58px] bg-[#101115] border-b border-[#1d1e26] px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <TextEndLogo
            onClick={onBackToHome}
            isDark={true}
            accentColor="text-cyan-400"
          />
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
            Paraphraser
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
          <span>Groq Powered</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex flex-col items-center">
        <div className="text-center mb-6 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Smart AI Paraphraser
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Rewrite sentences, paragraphs, and essays with enhanced clarity, fluency, and vocabulary powered by Groq.
          </p>
        </div>

        {/* Paraphraser Card */}
        <div className="w-full bg-[#131417] border border-[#202127] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Mode Selector Toolbar */}
          <div className="px-5 py-3 border-b border-[#1c1d23] flex flex-wrap items-center justify-between gap-3 bg-[#101115]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2">
                Modes:
              </span>
              {(['Standard', 'Fluency', 'Creative', 'Formal', 'Academic'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    mode === m
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 bg-[#181920] border border-[#252632]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setInputText(SAMPLE_TEXT);
                setOutputText('');
              }}
              className="text-xs text-indigo-400 hover:underline font-medium"
            >
              Load Sample Text
            </button>
          </div>

          {/* Split Editor Panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1e202a] min-h-[380px]">
            {/* Input Pane */}
            <div className="p-5 flex flex-col justify-between relative bg-[#131417]">
              {!inputText && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={handlePaste}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#2b2d3d] text-neutral-300 hover:text-white hover:bg-[#1a1b24] text-xs transition-colors"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#2b2d3d] text-neutral-300 hover:text-white hover:bg-[#1a1b24] text-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste text to paraphrase..."
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
                    Paraphrased Output
                  </span>
                  {usedModel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
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
                    <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Rewriting in {mode} mode...</span>
                  </div>
                ) : outputText ? (
                  <div className="whitespace-pre-wrap">{outputText}</div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-16">
                    <Sparkles className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs">Your paraphrased content will appear here.</p>
                  </div>
                )}
              </div>

              {outputText && (
                <div className="pt-3 border-t border-[#1c1d25] flex items-center justify-between text-xs text-neutral-400">
                  <span>Output: {outputWordCount} words</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="px-5 py-3.5 bg-[#0f1013] border-t border-[#1c1d23] flex items-center justify-end">
            <button
              onClick={handleParaphrase}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-2 px-7 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Paraphrasing...' : 'Paraphrase'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

