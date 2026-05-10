import { recognize } from 'tesseract.js';
import type { OcrSuggestion } from '$lib/types';

export function parseOcrText(text: string): OcrSuggestion[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const suggestions: OcrSuggestion[] = [];

  for (const line of lines) {
    const match = line.match(/^(.+?)\s+(\d{1,2})$/);
    if (!match) continue;

    const squadName = match[1].trim();
    const kills = Number(match[2]);

    if (!squadName || Number.isNaN(kills)) continue;
    suggestions.push({ squadName, kills });
  }

  return suggestions;
}

export async function extractSuggestionsFromImage(file: File) {
  const { data } = await recognize(file, 'eng');
  return {
    text: data.text,
    suggestions: parseOcrText(data.text)
  };
}
