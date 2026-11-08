import React, { useState } from 'react';
import { Scan, ShieldAlert, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';
import { scanTextForAIDetection } from '../services/groqHumanizerService';
import { DetectionResult } from '../types';

export const AIDetectorView: React.FC = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      await new Promise(r => setTimeout(r, 650));
      const scan = await scanTextForAIDetection(text, false);
      setResult(scan);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-[1200px] mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Scan className="w-6 h-6 text-indigo-400" />
          <span>AI Content Detector</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Detect content written by ChatGPT, GPT-4o, Claude 3.5, Gemini, and LLaMA with enterprise accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#141519] border border-[#22232b] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here to analyze for AI probability across Turnitin, GPTZero, and CopyLeaks..."
            className="w-full min-h-[340px] bg-transparent text-neutral-200 placeholder:text-neutral-600 focus:outline-none resize-none leading-relaxed text-sm"
          />

          <div className="pt-4 border-t border-[#1f2028] flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {text.trim() ? text.trim().split(/\s+/).length : 0} words
            </span>
            <button
              onClick={handleScan}
              disabled={analyzing || !text.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-neutral-900 font-semibold text-xs hover:bg-neutral-200 transition-all disabled:opacity-50"
            >
              <Scan className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Scanning...' : 'Scan Content'}</span>
            </button>
          </div>
        </div>

        <div className="bg-[#141519] border border-[#22232b] rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
          {!result ? (
            <div>
              <div className="w-12 h-12 rounded-full bg-[#1c1d24] border border-[#2b2c37] flex items-center justify-center mx-auto mb-3 text-neutral-400">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-neutral-300 mb-1">Awaiting Content</h3>
              <p className="text-xs text-neutral-500 max-w-[180px]">
                Paste your content and click Scan Content to see the analysis.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-5">
              <div className="w-28 h-28 rounded-full border-4 border-[#2b2c3a] flex flex-col items-center justify-center mx-auto relative shadow-inner">
                <span className="text-3xl font-extrabold text-white">{result.overallScore}%</span>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">AI Score</span>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                  result.overallScore > 50
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {result.overallScore > 50 ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{result.verdict}</span>
              </div>

              {/* Multi-detector breakdown */}
              <div className="w-full pt-4 border-t border-[#22232e] space-y-2.5 text-left">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Detector Comparison
                </span>
                {result.detectors.map((det) => (
                  <div key={det.name} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300">{det.name}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        det.score > 50
                          ? 'bg-rose-950/60 text-rose-400'
                          : det.score > 20
                          ? 'bg-amber-950/60 text-amber-400'
                          : 'bg-emerald-950/60 text-emerald-400'
                      }`}
                    >
                      {det.score}% AI
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
