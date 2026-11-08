import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Scan,
  FileCheck,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  MoreHorizontal,
  ChevronDown,
  Clipboard,
  Upload,
  Copy,
  Check,
  RotateCcw,
  FileText,
  AlignLeft,
  List,
  Key,
  Zap
} from 'lucide-react';
import { summarizeText, SummaryResult } from '../services/summarizerService';
import { getStoredGroqApiKey } from '../services/groqHumanizerService';
import { ApiKeyModal } from './ApiKeyModal';
import { TextEndLogo } from './icons/TextEndLogo';

interface SummarizePageProps {
  onBackToHome?: () => void;
  onGoToHumanizer?: () => void;
}

const SAMPLE_TEXT = `Artificial intelligence is transforming industries worldwide, from healthcare diagnostics to financial fraud detection and autonomous transportation. By training large-scale deep learning models on vast repositories of data, modern AI systems can recognize intricate patterns and generate human-like text, images, and audio. However, the rapid proliferation of generative artificial intelligence has also introduced substantial challenges regarding academic integrity, intellectual property rights, algorithmic bias, and the difficulty of verifying authentic authorship. Educational institutions and enterprises are increasingly relying on specialized detection algorithms and synthesis platforms to balance technological innovation with human oversight. As these technologies mature, maintaining transparency, verifiable attribution, and responsible usage will be critical to ensuring equitable benefits across global society.`;

export const SummarizePage: React.FC<SummarizePageProps> = ({
  onBackToHome,
  onGoToHumanizer
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [mode, setMode] = useState<'paragraph' | 'bullet'>('paragraph');
  const [lengthSetting, setLengthSetting] = useState<'short' | 'medium' | 'long'>('short');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Auto');
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isLengthOpen, setIsLengthOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasGroqKey(Boolean(getStoredGroqApiKey()));
  }, []);

  const refreshKeyStatus = () => {
    setHasGroqKey(Boolean(getStoredGroqApiKey()));
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const runSummarize = async (
    targetText: string = inputText,
    targetMode: 'paragraph' | 'bullet' = mode,
    targetLength: 'short' | 'medium' | 'long' = lengthSetting,
    targetLang: string = selectedLanguage
  ) => {
    if (!targetText.trim()) return;
    setIsLoading(true);

    try {
      const res = await summarizeText(targetText, {
        mode: targetMode,
        length: targetLength,
        language: targetLang
      });
      setSummaryResult(res);
    } catch (err) {
      console.error('Summarize error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run summary automatically when user toggles mode/length if there is already an output
  const handleModeChange = (newMode: 'paragraph' | 'bullet') => {
    setMode(newMode);
    if (summaryResult && inputText.trim()) {
      runSummarize(inputText, newMode, lengthSetting, selectedLanguage);
    }
  };

  const handleLengthChange = (newLen: 'short' | 'medium' | 'long') => {
    setLengthSetting(newLen);
    setIsLengthOpen(false);
    if (summaryResult && inputText.trim()) {
      runSummarize(inputText, mode, newLen, selectedLanguage);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    setIsLangOpen(false);
    if (summaryResult && inputText.trim()) {
      runSummarize(inputText, mode, lengthSetting, newLang);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCopySummary = () => {
    if (!summaryResult?.summary) return;
    navigator.clipboard.writeText(summaryResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-[#1f2937] font-sans relative overflow-x-hidden selection:bg-[#c2ebd9]">
      {/* Decorative background shapes */}
      <div className="absolute top-28 -left-12 w-64 h-24 bg-[#e8f6f0]/70 rounded-full blur-xl pointer-events-none -z-0" />
      <div className="absolute top-72 -left-8 w-80 h-16 bg-[#e4f3ff]/60 rounded-full blur-lg pointer-events-none -z-0" />
      <div className="absolute top-48 -right-16 w-72 h-20 bg-[#e7f7ed]/70 rounded-full blur-xl pointer-events-none -z-0" />
      <div className="absolute top-96 -right-10 w-96 h-24 bg-[#f0f9f5]/80 rounded-full blur-lg pointer-events-none -z-0" />

      {/* Top Navigation Bar */}
      <header className="h-[58px] bg-white border-b border-[#e5e7eb] px-6 flex items-center justify-between z-20 sticky top-0 shadow-xs">
        {/* Left: TextEnd Brand with 3D box logo redirecting to Home */}
        <div className="flex items-center gap-3">
          <TextEndLogo 
            onClick={onBackToHome} 
            isDark={false} 
            accentColor="text-[#1f7a3e]" 
          />
        </div>

        {/* Center: Title */}
        <div className="text-[14px] font-semibold text-[#374151]">
          Summarizer
        </div>

        {/* Right: Groq Key Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
              hasGroqKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title="Configure Groq AI inference key"
          >
            <Key className="w-3 h-3 text-emerald-600" />
            <span>{hasGroqKey ? 'Groq Active' : 'Connect Groq API'}</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Left Sidebar + Center Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tool Sidebar */}
        <aside className="w-[74px] bg-white border-r border-[#eceef1] flex flex-col items-center py-4 select-none flex-shrink-0 z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            {/* Paraphraser */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <RefreshCw className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">Paraphraser</span>
            </div>

            {/* Grammar Checker */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">Grammar<br />Checker</span>
            </div>

            {/* AI Detector */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <Scan className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">AI Detector</span>
            </div>

            {/* Plagiarism Checker */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <FileCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">Plagiarism<br />Checker</span>
            </div>

            {/* AI Humanizer (Active cross-link to TextEnd) */}
            <div
              onClick={onGoToHumanizer}
              className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1"
              title="Switch to TextEnd Humanizer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight text-neutral-800 font-semibold">AI Humanizer</span>
            </div>

            {/* AI Chat */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">AI Chat</span>
            </div>

            {/* AI Image Generator */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">AI Image<br />Generator</span>
            </div>

            {/* More */}
            <div className="flex flex-col items-center cursor-pointer text-[#6b7280] hover:text-[#1f7a3e] group w-full py-1">
              <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium leading-tight">More</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 flex flex-col items-center z-10">
          {/* Header Title & Subtitle */}
          <div className="text-center max-w-2xl mb-6">
            <h1 className="text-[32px] md:text-[36px] font-extrabold tracking-tight text-[#111827]">
              Free AI Summarizer
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#4b5563] mt-2 leading-relaxed">
              Condense articles, reports, or documents down to the key points instantly. Our AI uses
              natural language processing to locate critical information while maintaining the
              original context.
            </p>
          </div>

          {/* Central Summarizer Card */}
          <div className="w-full max-w-[1040px] bg-white border border-[#e2e8f0] rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="px-5 py-3 border-b border-[#edf0f4] flex flex-wrap items-center justify-between gap-3 bg-[#fafbfd]">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Language Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLangOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#d1d5db] bg-white text-xs font-medium text-[#374151] hover:bg-neutral-50 shadow-2xs transition-colors"
                  >
                    <span>Language ({selectedLanguage})</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {isLangOpen && (
                    <div className="absolute left-0 mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-30">
                      {['Auto', 'English (US)', 'English (UK)', 'Spanish', 'French', 'German'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Length Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsLengthOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#d1d5db] bg-white text-xs font-medium text-[#374151] hover:bg-neutral-50 shadow-2xs capitalize transition-colors"
                  >
                    <span>{lengthSetting}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {isLengthOpen && (
                    <div className="absolute left-0 mt-1 w-32 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-30">
                      {(['short', 'medium', 'long'] as const).map((len) => (
                        <button
                          key={len}
                          onClick={() => handleLengthChange(len)}
                          className="w-full text-left px-3 py-1.5 text-xs capitalize text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Paragraph / Bullet Points Segmented Switcher */}
                <div className="inline-flex items-center p-0.5 bg-[#f1f3f7] rounded-lg border border-[#e2e5eb]">
                  <button
                    onClick={() => handleModeChange('paragraph')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      mode === 'paragraph'
                        ? 'bg-white text-[#1f2937] shadow-xs'
                        : 'text-[#6b7280] hover:text-[#111827]'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Paragraph</span>
                  </button>

                  <button
                    onClick={() => handleModeChange('bullet')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      mode === 'bullet'
                        ? 'bg-white text-[#1f2937] shadow-xs'
                        : 'text-[#6b7280] hover:text-[#111827]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Bullet Points</span>
                  </button>
                </div>
              </div>

              {/* Sample text & clear button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInputText(SAMPLE_TEXT);
                    setSummaryResult(null);
                  }}
                  className="text-xs text-[#1f7a3e] hover:underline font-medium"
                >
                  Load Sample Text
                </button>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText('');
                      setSummaryResult(null);
                    }}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
                    title="Clear text"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Split Editor / Output Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#edf0f4] min-h-[360px]">
              {/* Left Pane: Input Box */}
              <div className="p-5 flex flex-col justify-between relative bg-white">
                {/* Paste / Upload Action Buttons */}
                {!inputText && (
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={handlePaste}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1f7a3e] text-[#1f7a3e] hover:bg-[#f0f9f4] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1f7a3e] text-[#1f7a3e] hover:bg-[#f0f9f4] text-xs font-medium transition-colors cursor-pointer"
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
                  placeholder='Enter or paste your text and press "Summarize"'
                  className="w-full flex-1 min-h-[260px] text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none resize-none leading-relaxed"
                />

                {/* Left Bottom Bar */}
                <div className="pt-3 border-t border-[#f3f4f6] flex items-center justify-between text-xs text-[#6b7280]">
                  <span>{wordCount} words ({charCount} characters)</span>
                </div>
              </div>

              {/* Right Pane: Summary Output Box */}
              <div className="p-5 flex flex-col justify-between bg-[#fafbfc] relative">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#edf0f4]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
                      AI Summary Output
                    </span>
                    {summaryResult?.usedModel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        {summaryResult.usedModel}
                      </span>
                    )}
                  </div>

                  {summaryResult && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        -{summaryResult.reductionPercentage}% condensed
                      </span>

                      <button
                        onClick={handleCopySummary}
                        className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#1f7a3e] px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors"
                        title="Copy summary"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Output Text Content */}
                <div className="flex-1 overflow-y-auto min-h-[240px] text-sm text-[#1f2937] leading-relaxed">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#6b7280] space-y-2 py-12">
                      <div className="w-6 h-6 border-2 border-[#1f7a3e] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">
                        Condensing key points with Groq AI...
                      </span>
                    </div>
                  ) : summaryResult ? (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {summaryResult.summary}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[#9ca3af] py-12">
                      <FileText className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">Your generated summary will appear here.</p>
                      <p className="text-[11px] text-[#9ca3af] mt-1">Select paragraph or bullet points mode above.</p>
                    </div>
                  )}
                </div>

                {/* Right Bottom Stats */}
                {summaryResult && (
                  <div className="pt-3 border-t border-[#edf0f4] flex items-center justify-between text-xs text-[#6b7280]">
                    <span>Output: {summaryResult.summaryWords} words</span>
                    <span>Original: {summaryResult.originalWords} words</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer with Summarize Action Button */}
            <div className="px-5 py-3 bg-white border-t border-[#edf0f4] flex items-center justify-end">
              <button
                onClick={() => runSummarize()}
                disabled={isLoading || !inputText.trim()}
                className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-[#1f7a3e] hover:bg-[#186433] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <span>Summarize</span>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Groq Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onKeyChanged={refreshKeyStatus}
      />
    </div>
  );
};
