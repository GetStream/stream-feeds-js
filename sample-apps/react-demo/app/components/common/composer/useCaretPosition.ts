import { useCallback, useRef } from 'react';

type StyleProperty =
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'fontStyle'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textTransform'
  | 'wordSpacing'
  | 'textIndent'
  | 'paddingTop'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingBottom'
  | 'borderLeftWidth'
  | 'borderTopWidth'
  | 'borderRightWidth'
  | 'borderBottomWidth'
  | 'boxSizing'
  | 'width'
  | 'whiteSpace'
  | 'wordWrap'
  | 'overflowWrap';

const MIRROR_STYLES: StyleProperty[] = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'wordSpacing',
  'textIndent',
  'paddingTop',
  'paddingLeft',
  'paddingRight',
  'paddingBottom',
  'borderLeftWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'boxSizing',
  'width',
  'whiteSpace',
  'wordWrap',
  'overflowWrap',
];

export type CaretPosition = {
  top: number;
  left: number;
  height: number;
};

export const useCaretPosition = () => {
  const mirrorRef = useRef<HTMLDivElement | null>(null);

  const getCaretPosition = useCallback(
    (textarea: HTMLTextAreaElement, caretIndex: number): CaretPosition | null => {
      if (!textarea) return null;

      // Create or reuse mirror div
      if (!mirrorRef.current) {
        mirrorRef.current = document.createElement('div');
        mirrorRef.current.style.position = 'absolute';
        mirrorRef.current.style.visibility = 'hidden';
        mirrorRef.current.style.whiteSpace = 'pre-wrap';
        mirrorRef.current.style.wordWrap = 'break-word';
        document.body.appendChild(mirrorRef.current);
      }

      const mirror = mirrorRef.current;
      const computed = window.getComputedStyle(textarea);

      // Copy textarea styles to mirror
      for (const prop of MIRROR_STYLES) {
        mirror.style[prop] = computed[prop];
      }

      // Set mirror dimensions to match textarea
      mirror.style.height = 'auto';
      mirror.style.overflow = 'hidden';

      // Get text up to caret and create marker
      const textBeforeCaret = textarea.value.substring(0, caretIndex);
      const textNode = document.createTextNode(textBeforeCaret);
      const marker = document.createElement('span');
      marker.textContent = '\u200b'; // Zero-width space

      mirror.innerHTML = '';
      mirror.appendChild(textNode);
      mirror.appendChild(marker);

      // Get textarea position
      const textareaRect = textarea.getBoundingClientRect();

      // Calculate caret position relative to viewport
      const markerRect = marker.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();

      // Adjust for textarea scroll
      const top =
        textareaRect.top +
        (markerRect.top - mirrorRect.top) -
        textarea.scrollTop +
        parseInt(computed.borderTopWidth, 10);
      const left =
        textareaRect.left +
        (markerRect.left - mirrorRect.left) -
        textarea.scrollLeft +
        parseInt(computed.borderLeftWidth, 10);

      const height = parseInt(computed.lineHeight, 10) || parseInt(computed.fontSize, 10) * 1.2;

      return { top, left, height };
    },
    [],
  );

  return { getCaretPosition };
};
