import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const LatexRenderer = ({ text }) => {
    if (!text) return null;

    // Split text by LaTeX delimiters while preserving them
    const parts = [];
    let remaining = text;
    let key = 0;

    // Process block math ($$...$$) first
    const blockMathRegex = /\$\$(.*?)\$\$/gs;
    let lastIndex = 0;
    let match;

    // Temporary replacement to protect inline math during block processing
    remaining = remaining.replace(/\$(.*?)\$/g, (match, content) => {
        return `INLINE_MATH_${key++}_${content}_INLINE_MATH`;
    });

    // Process block math
    while ((match = blockMathRegex.exec(remaining)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            const textBefore = remaining.substring(lastIndex, match.index);
            parts.push({ type: 'text', content: textBefore, key: key++ });
        }

        // Add block math
        parts.push({ type: 'block', content: match[1].trim(), key: key++ });
        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
        parts.push({ type: 'text', content: remaining.substring(lastIndex), key: key++ });
    }

    // Restore and process inline math
    const processedParts = [];
    parts.forEach((part) => {
        if (part.type === 'text') {
            const inlineMathRegex = /INLINE_MATH_(\d+)_(.*?)_INLINE_MATH/g;
            let text = part.content;
            let lastIdx = 0;
            let inlineMatch;

            while ((inlineMatch = inlineMathRegex.exec(text)) !== null) {
                // Add text before
                if (inlineMatch.index > lastIdx) {
                    processedParts.push({
                        type: 'text',
                        content: text.substring(lastIdx, inlineMatch.index),
                        key: key++
                    });
                }

                // Add inline math
                processedParts.push({
                    type: 'inline',
                    content: inlineMatch[2],
                    key: key++
                });

                lastIdx = inlineMatch.index + inlineMatch[0].length;
            }

            // Add remaining text
            if (lastIdx < text.length) {
                processedParts.push({
                    type: 'text',
                    content: text.substring(lastIdx),
                    key: key++
                });
            }
        } else {
            processedParts.push(part);
        }
    });

    return (
        <span>
            {processedParts.map((part) => {
                if (part.type === 'block') {
                    return (
                        <div key={part.key} style={{ margin: '16px 0' }}>
                            <BlockMath math={part.content} />
                        </div>
                    );
                } else if (part.type === 'inline') {
                    return <InlineMath key={part.key} math={part.content} />;
                } else {
                    return <span key={part.key}>{part.content}</span>;
                }
            })}
        </span>
    );
};
