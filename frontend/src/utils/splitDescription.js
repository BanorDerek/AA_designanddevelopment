// utils/splitDescription.js (or inline in ProjectDetail.jsx)
export function splitDescription(text) {
  if (!text) return { lead: '', rest: '' };

  // Prefer splitting on a paragraph break if the description has one
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  if (paragraphs.length > 1) {
    return { lead: paragraphs[0], rest: paragraphs.slice(1).join('\n\n') };
  }

  // Otherwise split roughly in half at a sentence boundary
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const mid = Math.ceil(sentences.length / 2);
  return {
    lead: sentences.slice(0, mid).join(' ').trim(),
    rest: sentences.slice(mid).join(' ').trim(),
  };
}