import React, { useState, useRef } from 'react';
import {
  ScanText,
  Upload,
  Copy,
  Check,
  Download,
  Trash2,
  FileCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TextEndLogo } from './icons/TextEndLogo';

interface TextExtractorViewProps {
  onBackToHome: () => void;
  onSendToHumanizer?: (text: string) => void;
  onSendToSummarizer?: (text: string) => void;
}

export const TextExtractorView: React.FC<TextExtractorViewProps> = ({
  onBackToHome,
  onSendToHumanizer,
  onSendToSummarizer
}) => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      let raw = (event.target?.result as string) || '';

      // Strip common HTML/XML tags and normalize excessive whitespaces
      if (file.name.endsWith('.html') || file.name.endsWith('.xml')) {
        raw = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<[^>]+>/g, ' ');
      }

      // Normalize line breaks & spaces
      const cleaned = raw
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      setExtractedText(cleaned);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleCleanPasted = (raw: string) => {
    const cleaned = raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    setExtractedText(cleaned);
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName ? `extracted-${fileName.replace(/\.[^/.]+$/, '')}.txt` : 'extracted-text.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0f] text-neutral-100 font-sans">
      {/* Top Header */}
      <header className="h-[58px] bg-[#101115] border-b border-[#1d1e26] px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <TextEndLogo
            onClick={onBackToHome}
            isDark={true}
            accentColor="text-amber-400"
          />
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
            Text Extractor
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
          <span>Fast Local Parser</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col items-center">
        <div className="text-center mb-6 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Universal Text Extractor
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Extract clean plain text from files, strip formatting or messy markup, and export instantly to Humanizer or Summarizer.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-8 border-2 border-dashed border-[#2b2d3d] hover:border-amber-400/60 rounded-2xl bg-[#121318] hover:bg-[#161720] transition-all cursor-pointer flex flex-col items-center justify-center text-center group mb-6 shadow-xl"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.html,.xml,.json,.csv,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-[#1a1b24] group-hover:bg-amber-500/15 text-neutral-400 group-hover:text-amber-400 flex items-center justify-center mb-3 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">
            {fileName ? `Loaded: ${fileName}` : 'Click or drop files to extract text'}
          </h3>
          <p className="text-xs text-neutral-500">
            Supports .TXT, .MD, .HTML, .JSON, .CSV, and document files
          </p>
        </div>

        {/* Extracted Text Result Box */}
        <div className="w-full bg-[#131417] border border-[#202127] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#1c1d23] flex flex-wrap items-center justify-between gap-3 bg-[#101115]">
            <div className="flex items-center gap-2">
              <ScanText className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Extracted Text Output
              </span>
            </div>

            {extractedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181922] border border-[#272838] text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181922] border border-[#272838] text-xs text-neutral-300 hover:text-white transition-colors"
                  title="Download as .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>

                <button
                  onClick={() => {
                    setExtractedText('');
                    setFileName('');
                  }}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-300"
                  title="Clear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <textarea
            value={extractedText}
            onChange={(e) => handleCleanPasted(e.target.value)}
            placeholder="Paste raw formatted content, dirty HTML markup, or upload a file above to extract clean text..."
            className="w-full p-5 min-h-[300px] bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none resize-y leading-relaxed font-mono"
          />

          <div className="px-5 py-3.5 bg-[#0f1013] border-t border-[#1c1d23] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <div>
              <span>{wordCount} words</span>
              <span className="mx-2">•</span>
              <span>{charCount} characters</span>
            </div>

            {extractedText && (
              <div className="flex items-center gap-2">
                {onSendToHumanizer && (
                  <button
                    onClick={() => onSendToHumanizer(extractedText)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                  >
                    <span>Send to Humanizer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {onSendToSummarizer && (
                  <button
                    onClick={() => onSendToSummarizer(extractedText)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                  >
                    <span>Send to Summarizer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

