/**
 * Paraphraser Service with Groq AI Inference
 */

import { getStoredGroqApiKey } from './groqHumanizerService';

export interface ParaphraseOptions {
  mode: 'Standard' | 'Fluency' | 'Creative' | 'Formal' | 'Academic';
}

export async function paraphraseText(
  text: string,
  options: ParaphraseOptions = { mode: 'Standard' }
): Promise<{ paraphrased: string; usedModel: string }> {
  const trimmed = text.trim();
  if (!trimmed) return { paraphrased: '', usedModel: 'None' };

  const apiKey = getStoredGroqApiKey();

  if (apiKey) {
    const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

    const modePromptMap: Record<string, string> = {
      Standard: 'Paraphrase naturally while preserving original meaning and tone.',
      Fluency: 'Improve sentence flow, grammar, and natural readability.',
      Creative: 'Rephrase with expressive, varied vocabulary and vivid sentence structures.',
      Formal: 'Rewrite into professional, authoritative, and sophisticated formal prose.',
      Academic: 'Rewrite using scholarly precision, formal terminology, and objective academic tone.'
    };

    const systemPrompt = `You are the TextEnd Paraphraser Engine.
Task: Rephrase the provided text in ${options.mode} mode.
Instruction: ${modePromptMap[options.mode] || modePromptMap.Standard}
Guidelines:
1. Retain all core facts, meanings, names, and logic without distortion.
2. Output ONLY the paraphrased text. Do not provide greetings, explanations, or quotes.`;

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
                { role: 'user', content: `Paraphrase this text:\n\n${trimmed}` }
              ],
              temperature: options.mode === 'Creative' ? 0.8 : 0.4,
              max_tokens: 2500
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
              return {
                paraphrased: content.replace(/^["']|["']$/g, '').trim(),
                usedModel: model
              };
            }
          }
        } catch (e) {
          // try next
        }
      }
    }
  }

  // Local rule-based fallback
  const fallback = localParaphrase(trimmed);
  return { paraphrased: fallback, usedModel: 'Local Heuristic' };
}

function localParaphrase(text: string): string {
  const synonyms: [RegExp, string][] = [
    [/\butilize\b/gi, 'use'],
    [/\bdemonstrate\b/gi, 'show'],
    [/\bcommence\b/gi, 'begin'],
    [/\bterminate\b/gi, 'end'],
    [/\bfacilitate\b/gi, 'help'],
    [/\bconsequently\b/gi, 'as a result'],
    [/\bfurthermore\b/gi, 'moreover'],
    [/\bin order to\b/gi, 'to'],
    [/\bapproximately\b/gi, 'about'],
    [/\bsubstantial\b/gi, 'significant'],
    [/\baccelerate\b/gi, 'speed up'],
    [/\bimplement\b/gi, 'carry out']
  ];

  let result = text;
  synonyms.forEach(([regex, rep]) => {
    result = result.replace(regex, rep);
  });
  return result;
}

