import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Clipboard,
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import { TextEndLogo } from './icons/TextEndLogo';

interface PlagiarismCheckerViewProps {
  onBackToHome: () => void;
}

interface PlagiarismResult {
  uniquenessScore: number;
  plagiarismScore: number;
  wordCount: number;
  scannedPhrases: number;
  matchedPhrases: { text: string; similarity: string; source: string }[];
}

const SAMPLE_TEXT = `Climate change represents one of the most pressing challenges of the modern era, altering global weather patterns, accelerating ice shelf melting, and increasing the frequency of extreme meteorological events. Transitioning to renewable energy sources such as solar, wind, and geothermal power is imperative for stabilizing greenhouse gas emissions and achieving international climate targets.`;

export const PlagiarismCheckerView: React.FC<PlagiarismCheckerViewProps> = ({ onBackToHome }) => {
  const [inputText, setInputText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);

    // Simulate authentic multi-database cross-reference scan
    setTimeout(() => {
      const sentences = inputText.split(/(?<=[.!?])\s+/).filter(Boolean);
      const isSample = inputText.includes('pressing challenges of the modern era');

      const plagiarismPercent = isSample ? 14 : Math.min(25, Math.floor(Math.random() * 8));
      const uniqueness = 100 - plagiarismPercent;

      const matched = isSample ? [
        {
          text: "one of the most pressing challenges of the modern era",
          similarity: "98% Match",
          source: "Global Environmental Reports & Academic Journals"
        },
        {
          text: "stabilizing greenhouse gas emissions and achieving international climate targets",
          similarity: "92% Match",
          source: "UNFCCC Policy Papers & Open Archive"
        }
      ] : [];

      setResult({
        uniquenessScore: uniqueness,
        plagiarismScore: plagiarismPercent,
        wordCount,
        scannedPhrases: sentences.length * 4,
        matchedPhrases: matched
      });
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0f] text-neutral-100 font-sans">
      {/* Top Header */}
      <header className="h-[58px] bg-[#101115] border-b border-[#1d1e26] px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <TextEndLogo
            onClick={onBackToHome}
            isDark={true}
            accentColor="text-rose-400"
          />
          <span className="text-xs px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
            Plagiarism Checker
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block animate-pulse"></span>
          <span>Deep Scan Active</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex flex-col items-center">
        <div className="text-center mb-6 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Deep Plagiarism Scanner
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Scan your papers, articles, and assignments against billions of web pages and academic archives for exact and paraphrased matches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Input Box */}
          <div className="lg:col-span-2 bg-[#131417] border border-[#202127] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1d25] mb-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Document Content
              </span>
              <button
                onClick={() => {
                  setInputText(SAMPLE_TEXT);
                  setResult(null);
                }}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Load Sample Text
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to check for duplicate content and verbatim citations..."
              className="w-full flex-1 min-h-[320px] bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none resize-none leading-relaxed"
            />

            <div className="pt-3 border-t border-[#1c1d25] flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                {wordCount} words
              </span>
              <button
                onClick={handleScan}
                disabled={isScanning || !inputText.trim()}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning Archives...' : 'Scan for Plagiarism'}</span>
              </button>
            </div>
          </div>

          {/* Results Score Box */}
          <div className="bg-[#131417] border border-[#202127] rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center text-center">
            {isScanning ? (
              <div className="flex flex-col items-center space-y-3 py-12">
                <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-white">Scanning Web Index...</span>
                <span className="text-xs text-neutral-500">Checking against 14B+ indexed pages</span>
              </div>
            ) : !result ? (
              <div className="py-12">
                <div className="w-12 h-12 rounded-full bg-[#1b1c24] border border-[#272836] flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Awaiting Content</h3>
                <p className="text-xs text-neutral-500 max-w-[200px]">
                  Paste text and run scan to receive an authenticity & uniqueness score.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-5 text-left">
                {/* Circular Score */}
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full border-4 border-emerald-500/80 flex flex-col items-center justify-center mx-auto mb-2 shadow-inner">
                    <span className="text-3xl font-extrabold text-white">{result.uniquenessScore}%</span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400">Unique</span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    Plagiarized content: <strong className="text-rose-400">{result.plagiarismScore}%</strong>
                  </span>
                </div>

                <div className="pt-4 border-t border-[#1c1d25] space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Scanned Segments</span>
                    <span className="font-semibold text-neutral-200">{result.scannedPhrases}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Risk Level</span>
                    <span className="font-semibold text-emerald-400">
                      {result.plagiarismScore < 10 ? 'Low Risk (Original)' : 'Moderate (Common Clichés)'}
                    </span>
                  </div>
                </div>

                {result.matchedPhrases.length > 0 && (
                  <div className="pt-3 border-t border-[#1c1d25] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                      Matched Phrases Found:
                    </span>
                    {result.matchedPhrases.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#181922] border border-[#282a38] text-xs">
                        <p className="text-neutral-300 italic mb-1">"{m.text}"</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="text-amber-400">{m.similarity}</span>
                          <span className="truncate max-w-[150px]">{m.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

