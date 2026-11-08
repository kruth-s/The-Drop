import React from 'react';
import { Scan, ShieldAlert, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { DetectionResult } from '../types';

interface DetectionScoreCardProps {
  result: DetectionResult | null;
  isScanning: boolean;
  onScanClick: () => void;
  hasText: boolean;
}

export const DetectionScoreCard: React.FC<DetectionScoreCardProps> = ({
  result,
  isScanning,
  onScanClick,
  hasText
}) => {
  return (
    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col bg-[#141519] border border-[#23242c] rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#21222a] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">
          Detection Score
        </h3>
        {result && (
          <button
            onClick={onScanClick}
            disabled={isScanning || !hasText}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-40"
            title="Re-scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Re-check</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[220px]">
        {isScanning ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-700 border-t-white animate-spin flex items-center justify-center">
              <Scan className="w-5 h-5 text-neutral-300 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-200">Scanning with 5 AI Engines...</p>
              <p className="text-xs text-neutral-500 mt-1">Analyzing perplexity & burstiness</p>
            </div>
          </div>
        ) : !result ? (
          /* Empty state - EXACT MATCH to screenshot */
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#1c1d24] border border-[#2b2c37] flex items-center justify-center mb-3 text-neutral-400">
              <Scan className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-medium text-neutral-300 mb-1">
              No score yet
            </h4>
            <p className="text-xs text-neutral-500 max-w-[200px] leading-relaxed">
              Click &quot;Check for AI&quot; to scan your text
            </p>
          </div>
        ) : (
          /* Scanned results view */
          <div className="w-full space-y-5">
            {/* Main Score circle */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#20212b]"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ease-out ${
                      result.overallScore > 50
                        ? 'stroke-red-500'
                        : result.overallScore > 20
                        ? 'stroke-amber-400'
                        : 'stroke-emerald-400'
                    }`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.overallScore) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    {result.overallScore}%
                  </span>
                  <span className="text-[10px] uppercase font-medium text-neutral-400">
                    AI Probability
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  result.overallScore > 50
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : result.overallScore > 20
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {result.overallScore > 50 ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : result.overallScore > 20 ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{result.verdict}</span>
              </div>
            </div>

            {/* Detector Breakdown */}
            <div className="w-full space-y-2 pt-2 border-t border-[#21222a]">
              <div className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">
                Detector Breakdown
              </div>
              {result.detectors.map((det) => (
                <div
                  key={det.name}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-[#191a21] border border-[#262732]"
                >
                  <span className="text-neutral-300 font-medium">{det.name}</span>
                  <span
                    className={`font-semibold ${
                      det.score > 50
                        ? 'text-red-400'
                        : det.score > 20
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    {det.score}% AI
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-neutral-500 text-center">
              Scanned at {result.scannedAt}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

