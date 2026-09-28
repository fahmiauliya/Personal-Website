import { useEffect, useRef, useState } from 'react';
import copyIcon from '../assets/icons/copy-email.svg';
import { CONTACT_EMAIL } from '../data/portfolio';

// How long "Copied" stays before the button returns to "Copy Email".
const COPIED_MS = 1800;

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No async clipboard (an insecure origin, or permission refused): the legacy path.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }
}

/**
 * "Copy Email": copies the address, then shows "Copied" with a check for a moment. Both
 * states sit in the same grid cell, so the button keeps the wider label's width and never
 * jumps; the swap is a short blur, fade and lift (global.css, .copy-email).
 */
export default function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (!(await copyText(CONTACT_EMAIL))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return <>
    <button
      className="pill-button pill-button--light skeuo-button copy-email"
      type="button"
      onClick={copy}
      data-copied={copied || undefined}
      aria-label={`Copy email address, ${CONTACT_EMAIL}`}
    >
      <span className="copy-email-swap" aria-hidden="true">
        <span className="copy-email-state copy-email-state--idle">
          <span>Copy Email</span>
          <img src={copyIcon} alt="" />
        </span>
        <span className="copy-email-state copy-email-state--done">
          <span>Copied</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.4 5.7 10 11 4.2" stroke="#1C1F21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </button>
    <span className="visually-hidden" role="status">{copied ? 'Email copied to clipboard' : ''}</span>
  </>;
}
