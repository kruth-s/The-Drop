/**
 * TextEnd Elaborator Service with Groq AI Inference
 */

import { getStoredGroqApiKey } from './groqHumanizerService';

export interface ElaborateOptions {
  depth: 'Balanced' | 'In-Depth' | 'Comprehensive';
  tone: 'Professional' | 'Academic' | 'Creative' | 'Conversational';
}

export async function elaborateText(
  text: string,
  options: ElaborateOptions = { depth: 'In-Depth', tone: 'Professional' }
): Promise<{ elaborated: string; usedModel: string }> {
  const trimmed = text.trim();
  if (!trimmed) return { elaborated: '', usedModel: 'None' };

  const apiKey = getStoredGroqApiKey();

  if (apiKey) {
    const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

    const depthInstruction = options.depth === 'Balanced'
      ? 'Expand moderately (2x-3x length), adding concrete explanations and context to each point.'
      : options.depth === 'In-Depth'
      ? 'Expand thoroughly (3x-4x length), providing rich analytical details, background context, and clear real-world examples.'
      : 'Provide comprehensive, exhaustive elaboration (4x-6x length), deeply exploring mechanisms, nuances, counterarguments, and actionable implications.';

    const systemPrompt = `You are the TextEnd Elaborator Engine.
Your task is to take brief notes, sentences, ideas, or concise outlines and elaborate them into rich, articulate, well-developed paragraphs.

INSTRUCTIONS:
1. Depth: ${depthInstruction}
2. Tone: Write in a ${options.tone} tone.
3. Logical Continuity: Ensure smooth transitions between ideas and natural flow.
4. Value Addition: Add insightful illustrations, reasoning, and context without fluff or repetitive filler.
5. Formatting: Output ONLY the elaborated text. Do not provide greetings, preamble (no "Here is the elaboration:"), or meta-commentary.`;

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
                { role: 'user', content: `Elaborate on the following text:\n\n${trimmed}` }
              ],
              temperature: 0.7,
              max_tokens: 3000
            })
          });

          if (response.ok) {
            const data = await response.json();
            const choice = data.choices?.[0]?.message;
            let content = choice?.content?.trim();

            if (!content && choice?.reasoning) {
              const lines = choice.reasoning.trim().split('\n');
              content = lines.slice(-10).join(' ').trim();
            }

            if (content) {
              return {
                elaborated: content.replace(/^["']|["']$/g, '').trim(),
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

  // Local fallback
  return {
    elaborated: localElaborate(trimmed),
    usedModel: 'Local Expander'
  };
}

function localElaborate(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.map(s => {
    return `${s} More specifically, this fundamental principle demonstrates how structured approaches drive noticeable outcomes across diverse operational environments. For instance, when implemented systematically, it establishes clear benchmarks and ensures sustained long-term efficacy.`;
  }).join('\n\n');
}

