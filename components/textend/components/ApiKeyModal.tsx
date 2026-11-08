import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import { getStoredGroqApiKey, setStoredGroqApiKey } from '../services/groqHumanizerService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChanged?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyChanged
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGroqApiKey());
      setIsSaved(false);
      setTestStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGroqApiKey(apiKey.trim());
    setIsSaved(true);
    if (onKeyChanged) onKeyChanged();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setStoredGroqApiKey('');
    setApiKey('');
    if (onKeyChanged) onKeyChanged();
    setTestStatus('idle');
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API key first');
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      const endpoints = [
        '/api/groq/openai/v1/chat/completions',
        'https://api.groq.com/openai/v1/chat/completions'
      ];
      let ok = false;
      let lastErr = '';

      for (const ep of endpoints) {
        try {
          const response = await fetch(ep, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
              model: 'qwen/qwen3.8-27b',
              messages: [{ role: 'user', content: 'Say OK' }],
              max_tokens: 5
            })
          });

          if (response.ok) {
            ok = true;
            break;
          } else {
            const data = await response.json().catch(() => ({}));
            lastErr = data?.error?.message || `HTTP ${response.status}`;
          }
        } catch (e: any) {
          lastErr = e?.message || 'Network error';
        }
      }

      if (ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setErrorMessage(lastErr || 'Invalid API key or network error');
      }
    } catch (err: any) {
      setTestStatus('error');
      setErrorMessage(err.message || 'Connection failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#131419] border border-[#262835] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21232e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Key className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Groq API Key Setup</h2>
              <p className="text-xs text-neutral-400">Power TextEnd with Llama 3.3 70B & 8B</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#191a24] border border-[#27293a] rounded-xl text-xs text-neutral-300 flex items-start gap-2.5 leading-relaxed">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span>Groq delivers ultra-fast humanization inference. You can get a free key from </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                console.groq.com/keys <ExternalLink className="w-3 h-3 inline" />
              </a>
              <span>.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Groq API Key (gsk_...)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#181922] border border-[#2b2d3d] rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-400 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Status feedback */}
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
              <Check className="w-4 h-4" />
              <span>Valid Groq API Key! Connection successful.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage || 'Connection failed. Please verify your key.'}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Key is securely stored in your browser's local storage only.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#101115] border-t border-[#1e202a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={testStatus === 'testing' || !apiKey.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-[#1e202b] hover:bg-[#282a3a] border border-[#2e3040] transition-colors disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Key'}
            </button>

            {apiKey && (
              <button
                onClick={handleClear}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Key</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

