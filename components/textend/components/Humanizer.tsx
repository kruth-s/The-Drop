import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Scan,
  Clock,
  Sliders,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  Sparkle,
  Key,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ModelType, DetectionResult, AdvancedSettings } from '../types';
import { DetectionScoreCard } from './DetectionScoreCard';
import { HowToUseModal } from './HowToUseModal';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';
import { ApiKeyModal } from './ApiKeyModal';
import {
  humanizeWithGroq,
  scanTextForAIDetection,
  getStoredGroqApiKey,
  localHeuristicHumanize
} from '../services/groqHumanizerService';

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: "Minimal light rewrite with subtle word adjustments",
  2: "Light rewrite preserving sentence structures",
  3: "Gentle rephrasing with simplified flow",
  4: "Balanced rewriting for natural casual tone",
  5: "Moderate restructuring with varied sentence lengths",
  6: "Deep rephrasing with diversified vocabulary",
  7: "High variation restructuring to break AI predictability",
  8: "Heavy rewrite with maximum variation", // Exact match from screenshot
  9: "Aggressive transformation to bypass strict institutional detectors",
  10: "Ultimate humanization with total structural & lexical reimagining"
};

const SAMPLE_AI_TEXT = `Artificial intelligence has undeniably revolutionized numerous sectors, playing a pivotal role in streamlining workflows and fostering innovation. In today's rapidly evolving digital landscape, it is essential to recognize how machine learning algorithms delve into complex data patterns to deliver actionable insights. Furthermore, the integration of automated systems stands as a testament to human ingenuity. In conclusion, adopting these cutting-edge methodologies is imperative for ensuring long-term operational success.`;

export const Humanizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [humanizedText, setHumanizedText] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(8); // Default 8 as in screenshot
  const [selectedModel, setSelectedModel] = useState<ModelType>('Ghost 5.2 Mini');
  const [isLegacyOpen, setIsLegacyOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isHumanizing, setIsHumanizing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [showHowToUse, setShowHowToUse] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [usedEngine, setUsedEngine] = useState<string | null>(null);

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    preserveKeywords: '',
    targetTone: 'Standard',
    bypassTarget: 'All Major Detectors',
    readabilityLevel: 'College',
    sentenceVariation: 'Maximum'
  });

  useEffect(() => {
    setHasGroqKey(Boolean(getStoredGroqApiKey()));
  }, []);

  const refreshKeyStatus = () => {
    setHasGroqKey(Boolean(getStoredGroqApiKey()));
  };

  // Word count
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const wordLimit = 1500;

  // Handle Check for AI
  const handleCheckForAI = async () => {
    if (!inputText.trim()) return;

    setIsScanning(true);
    try {
      const isPostHumanize = Boolean(humanizedText && inputText.trim() === humanizedText.trim());
      // Short delay for realistic scanning feel
      await new Promise(r => setTimeout(r, 600));
      const res = await scanTextForAIDetection(inputText, isPostHumanize);
      setDetectionResult(res);
    } catch (err) {
      console.error('Check for AI error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle Humanize with Groq / Local Stealth Engine
  const handleHumanize = async () => {
    if (!inputText.trim()) return;

    setIsHumanizing(true);
    setProcessingStatus(
      hasGroqKey
        ? `Rewriting with ${selectedModel} via Groq Engine...`
        : `Humanizing with Level ${selectedLevel} Stealth Algorithm...`
    );

    try {
      const { text: rewritten, usedGroq, modelName } = await humanizeWithGroq(
        inputText,
        selectedLevel,
        selectedModel,
        advancedSettings
      );

      setHumanizedText(rewritten);
      setInputText(rewritten);
      setUsedEngine(usedGroq ? modelName : 'Stealth Algorithmic');

      // Auto-scan rewritten text
      const scanRes = await scanTextForAIDetection(rewritten, true);
      setDetectionResult(scanRes);
    } catch (err) {
      console.error('Humanization error:', err);
      // Fallback
      const fallbackText = localHeuristicHumanize(inputText, selectedLevel, advancedSettings);
      setHumanizedText(fallbackText);
      setInputText(fallbackText);
      setUsedEngine('Stealth Algorithmic');
      const scanRes = await scanTextForAIDetection(fallbackText, true);
      setDetectionResult(scanRes);
    } finally {
      setIsHumanizing(false);
      setProcessingStatus('');
    }
  };

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInputText(SAMPLE_AI_TEXT);
    setDetectionResult(null);
    setHumanizedText(null);
    setUsedEngine(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-7 max-w-[1520px] mx-auto w-full">
      {/* Title & Top Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold tracking-tight text-white">
              Humanizer
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Ghost 5.2 Architecture
            </span>
          </div>
          <p className="text-[13px] text-neutral-400 mt-1 font-normal">
            Paste your AI-generated text below and humanize it with authentic perplexity and burstiness.
          </p>
        </div>

        {/* Action Pills: Groq Key & How to Use */}
        <div className="flex items-center gap-2">
          {/* Groq Key Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
              hasGroqKey
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40'
            }`}
            title="Configure Groq API key for Llama 3.3 70B & 8B neural inference"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasGroqKey ? 'Groq Key Active' : 'Connect Groq API'}</span>
          </button>

          {/* How to use */}
          <button
            onClick={() => setShowHowToUse(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2e303b] bg-[#181920]/80 hover:bg-[#23242e] text-neutral-300 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span>How to use</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Editor Card on Left, Detection Score on Right */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* Central Editor Card */}
        <div className="flex-1 w-full flex flex-col bg-[#131417] border border-[#202127] rounded-xl overflow-hidden shadow-2xl">
          {/* Top Controls: Level & Model */}
          <div className="px-5 py-4 space-y-3.5 border-b border-[#1c1d23]">
            {/* Level Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-medium text-neutral-300 min-w-[46px]">
                Level
              </span>
              
              {/* Segmented Numbers 1 through 10 */}
              <div className="inline-flex items-center bg-[#191a1f] border border-[#262831] rounded-lg p-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isActive = selectedLevel === num;
                  return (
                    <button
                      key={num}
                      onClick={() => setSelectedLevel(num)}
                      className={`w-7 h-6 sm:w-7 sm:h-6 rounded text-xs font-medium transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Description for Selected Level */}
              <span className="text-xs text-neutral-400 pl-1 font-normal select-none">
                {LEVEL_DESCRIPTIONS[selectedLevel]}
              </span>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-neutral-300 min-w-[46px]">
                Model
              </span>

              <div className="relative inline-flex items-center gap-1 bg-[#191a1f] border border-[#262831] rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedModel('Ghost 5.2 Mini')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedModel === 'Ghost 5.2 Mini'
                      ? 'bg-[#222329] text-white shadow-sm border border-[#323440]'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Fast Llama 3.1 8B Instant Engine"
                >
                  Ghost 5.2 Mini
                </button>

                <button
                  onClick={() => setSelectedModel('Ghost 5.2 Pro')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedModel === 'Ghost 5.2 Pro'
                      ? 'bg-[#222329] text-white shadow-sm border border-[#323440]'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Deep Llama 3.3 70B Versatile Engine"
                >
                  Ghost 5.2 Pro
                </button>

                {/* Legacy Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLegacyOpen(prev => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <span>Legacy</span>
                    <ChevronDown className="w-3 h-3 text-neutral-500" />
                  </button>

                  {isLegacyOpen && (
                    <div className="absolute left-0 mt-1.5 w-36 bg-[#1a1b22] border border-[#2c2e3d] rounded-lg shadow-xl py-1 z-30">
                      {(['Ghost 5.1', 'Ghost 5.0', 'Ghost 4.8'] as const).map((ver) => (
                        <button
                          key={ver}
                          onClick={() => {
                            setSelectedModel('Legacy');
                            setIsLegacyOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-[#252735] hover:text-white transition-colors"
                        >
                          {ver}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status pill of active backend */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-400 pl-2">
                <span className={`w-1.5 h-1.5 rounded-full ${hasGroqKey ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                <span>{hasGroqKey ? 'Groq Neural Cloud' : 'Local Heuristic Mode'}</span>
              </div>
            </div>
          </div>

          {/* Text Area & Quick Helpers */}
          <div className="relative p-5 flex-1 flex flex-col min-h-[380px]">
            {/* Sample text helper when empty */}
            {!inputText && (
              <div className="absolute right-5 top-5 z-10">
                <button
                  onClick={loadSample}
                  className="text-xs text-neutral-400 hover:text-white bg-[#191a20] px-2.5 py-1 rounded border border-[#272834] transition-colors"
                >
                  Load Sample AI Text
                </button>
              </div>
            )}

            {/* Copy / Clear buttons when text is present */}
            {inputText && (
              <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
                {usedEngine && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#1e202b] text-neutral-300 border border-[#2c2e3d]">
                    Humanized via {usedEngine}
                  </span>
                )}

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white bg-[#191a20] px-2.5 py-1 rounded border border-[#272834] transition-colors"
                  title="Copy text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setInputText('');
                    setHumanizedText(null);
                    setDetectionResult(null);
                    setUsedEngine(null);
                  }}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-[#1f202a] transition-colors"
                  title="Clear text"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your AI-generated text here..."
              className="w-full flex-1 min-h-[320px] bg-transparent text-sm sm:text-[14px] text-neutral-200 placeholder:text-neutral-600 focus:outline-none resize-y leading-relaxed font-normal"
            />

            {/* In-progress banner */}
            {isHumanizing && (
              <div className="absolute inset-0 bg-[#131417]/85 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-20">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-neutral-200">
                  {processingStatus || 'Humanizing text with Ghost 5.2...'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Injecting natural burstiness and destroying AI patterns
                </span>
              </div>
            )}
          </div>

          {/* Bottom Bar: Word Counts, Badges, and Action Buttons */}
          <div className="px-5 py-3.5 bg-[#101114] border-t border-[#1b1c22] flex flex-wrap items-center justify-between gap-4">
            {/* Left Status & Quota Details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <span className="font-medium text-neutral-300">
                {wordCount.toLocaleString()}/{wordLimit.toLocaleString()} words
              </span>

              <div className="flex items-center gap-1.5 text-neutral-400">
                <Sparkle className="w-3.5 h-3.5 text-neutral-400" />
                <span>Unlimited humanizations</span>
              </div>

              <div className="flex items-center gap-1.5 text-neutral-400">
                <Scan className="w-3.5 h-3.5 text-neutral-400" />
                <span>5-Engine deep scan</span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Check for AI Button */}
              <button
                onClick={handleCheckForAI}
                disabled={isScanning || isHumanizing || !inputText.trim()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1a1b21] hover:bg-[#23242c] border border-[#2b2d37] text-neutral-300 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Check for AI'}</span>
              </button>

              {/* Humanize Button */}
              <button
                onClick={handleHumanize}
                disabled={isHumanizing || isScanning || !inputText.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isHumanizing ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
                <span>{isHumanizing ? 'Humanizing...' : 'Humanize'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detection Score Card */}
        <DetectionScoreCard
          result={detectionResult}
          isScanning={isScanning}
          onScanClick={handleCheckForAI}
          hasText={!!inputText.trim()}
        />
      </div>

      {/* Advanced Settings Link Below Card */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowAdvancedSettings(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors py-1 px-3 rounded-md hover:bg-[#15161c]"
        >
          <Sliders className="w-3.5 h-3.5 text-neutral-500" />
          <span>Advanced Settings</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
        </button>
      </div>

      {/* Modals */}
      <HowToUseModal
        isOpen={showHowToUse}
        onClose={() => setShowHowToUse(false)}
      />

      <AdvancedSettingsModal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        settings={advancedSettings}
        setSettings={setAdvancedSettings}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onKeyChanged={refreshKeyStatus}
      />
    </div>
  );
};
