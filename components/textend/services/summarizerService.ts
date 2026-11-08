/**
 * QuillBot Summarization Engine with Groq AI Inference & Local Fallback
 * Supported Groq models:
 * - qwen/qwen3.8-27b (Fast, direct summarizer)
 * - openai/gpt-oss-120b (Deep contextual condensation)
 * - openai/gpt-oss-20b (Lightweight summary engine)
 */

import { getStoredGroqApiKey } from './groqHumanizerService';

export interface SummaryOptions {
  mode: 'paragraph' | 'bullet';
  length: 'short' | 'medium' | 'long';
  language?: string;
}

export interface SummaryResult {
  summary: string;
  originalWords: number;
  summaryWords: number;
  reductionPercentage: number;
  sentenceCount?: number;
  bulletPoints?: string[];
  usedModel?: string;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll',
  'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d',
  'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me',
  'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

export async function summarizeText(
  text: string,
  options: SummaryOptions = { mode: 'paragraph', length: 'short', language: 'Auto' }
): Promise<SummaryResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      summary: '',
      originalWords: 0,
      summaryWords: 0,
      reductionPercentage: 0
    };
  }

  const originalWords = trimmed.split(/\s+/).length;
  const apiKey = getStoredGroqApiKey();

  // Try Groq API if key is available
  if (apiKey) {
    const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

    const lengthInstruction = options.length === 'short'
      ? 'Condense tightly into 1-2 core sentences (if paragraph) or 2-3 brief bullet points (if bullet mode). Focus only on the single main thesis.'
      : options.length === 'medium'
      ? 'Condense into 3-4 well-rounded sentences (if paragraph) or 4-5 bullet points (if bullet mode), covering key arguments and evidence.'
      : 'Provide a comprehensive summary of 5-7 sentences (if paragraph) or 6-8 detailed bullet points (if bullet mode), preserving secondary points and nuanced conclusions.';

    const modeInstruction = options.mode === 'bullet'
      ? 'Output MUST be formatted strictly as clear bullet points starting with "• ". Do NOT write conversational introductions, headings, or summaries of the summary.'
      : 'Output MUST be formatted strictly as a single, highly coherent, elegant paragraph. Do NOT output bullet lists, meta explanations, or introductions.';

    const langInstruction = options.language && options.language !== 'Auto'
      ? `Language requirement: Translate and write the summary strictly in ${options.language}.`
      : 'Language requirement: Keep the exact same language as the input text.';

    const systemPrompt = `You are the QuillBot Summarizer Engine. Your objective is to read the provided text and synthesize it into an accurate, high-retention summary.

CRITICAL INSTRUCTIONS:
1. ${lengthInstruction}
2. ${modeInstruction}
3. ${langInstruction}
4. Retain accurate terminology, names, statistics, and essential claims.
5. Never hallucinate facts or add external opinions.
6. Output ONLY the summary text itself. Zero preamble (no "Here is the summary:", no quotes).`;

    const endpoints = [
      '/api/groq/openai/v1/chat/completions',
      'https://api.groq.com/openai/v1/chat/completions'
    ];

    for (const model of candidateModels) {
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Summarize this text:\n\n${trimmed}` }
              ],
              temperature: 0.2,
              max_tokens: 1500
            })
          });

          if (response.ok) {
            const data = await response.json();
            const choice = data.choices?.[0]?.message;
            let content = choice?.content?.trim();

            if (!content && choice?.reasoning) {
              const lines = choice.reasoning.trim().split('\n');
              content = lines.slice(-8).join(' ').trim();
            }

            if (content) {
              const cleaned = content.replace(/^["']|["']$/g, '').trim();
              const summaryWords = cleaned.split(/\s+/).length;
              const reductionPercentage = Math.max(
                0,
                Math.round(((originalWords - summaryWords) / originalWords) * 100)
              );
              const sentenceCount = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean).length;

              return {
                summary: cleaned,
                originalWords,
                summaryWords,
                reductionPercentage,
                sentenceCount,
                usedModel: model
              };
            }
          } else {
            console.warn(`Groq summarizer endpoint ${endpoint} model ${model} failed, trying next...`);
            break;
          }
        } catch (fetchErr) {
          console.warn(`Fetch error for ${endpoint}:`, fetchErr);
        }
      }
    }
  }

  // Local extractive algorithmic summarizer fallback
  return localExtractiveSummarize(trimmed, options);
}

function localExtractiveSummarize(trimmed: string, options: SummaryOptions): SummaryResult {
  const originalWords = trimmed.split(/\s+/).length;

  const rawSentences = trimmed
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|__SPLIT__|')
    .split('|__SPLIT__|')
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (rawSentences.length <= 1) {
    return {
      summary: trimmed,
      originalWords,
      summaryWords: originalWords,
      reductionPercentage: 0,
      bulletPoints: [trimmed],
      sentenceCount: 1,
      usedModel: 'Local Extractive'
    };
  }

  const words = trimmed.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const scored = rawSentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let score = 0;
    for (const w of sWords) {
      if (freq[w]) {
        score += freq[w];
      }
    }
    score = score / Math.max(sWords.length, 1);

    if (index === 0) score *= 1.4;
    else if (index === 1) score *= 1.2;
    else if (index === rawSentences.length - 1) score *= 1.15;

    return { sentence, score, index };
  });

  let targetCount = 2;
  if (options.length === 'short') {
    targetCount = Math.max(1, Math.min(3, Math.ceil(rawSentences.length * 0.25)));
  } else if (options.length === 'medium') {
    targetCount = Math.max(2, Math.min(5, Math.ceil(rawSentences.length * 0.45)));
  } else {
    targetCount = Math.max(3, Math.min(8, Math.ceil(rawSentences.length * 0.65)));
  }

  const topSentences = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);

  const bulletPoints = topSentences.map(s => s.replace(/\s+/g, ' ').trim());
  let summary = '';

  if (options.mode === 'bullet') {
    summary = bulletPoints.map(bp => `• ${bp}`).join('\n\n');
  } else {
    summary = topSentences.join(' ');
  }

  const summaryWords = summary.trim().split(/\s+/).length;
  const reductionPercentage = Math.max(
    0,
    Math.round(((originalWords - summaryWords) / originalWords) * 100)
  );
  const sentenceCount = topSentences.length;

  return {
    summary,
    originalWords,
    summaryWords,
    reductionPercentage,
    sentenceCount,
    bulletPoints,
    usedModel: 'Local Extractive'
  };
}
