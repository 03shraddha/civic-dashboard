import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useStore } from '../../store';

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ color: '#6366f1', fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export function WardSearch() {
  const { wardStats, activeWardName, setActiveWardName } = useStore();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allWards = Array.from(wardStats.keys()).sort();

  const suggestions = query.trim().length === 0
    ? []
    : allWards.filter(w => w.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  const select = useCallback((wardName: string) => {
    setActiveWardName(wardName);
    setQuery(wardName);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.blur();
  }, [setActiveWardName]);

  const clear = useCallback(() => {
    setQuery('');
    setOpen(false);
    setActiveIdx(-1);
    setActiveWardName(null);
    inputRef.current?.focus();
  }, [setActiveWardName]);

  useEffect(() => {
    if (activeWardName && query === '') setQuery('');
  }, [activeWardName, query]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) select(suggestions[activeIdx]);
      else if (suggestions.length === 1) select(suggestions[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  const hasValue = query.length > 0;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Label */}
      <div style={{
        fontSize: '11px', fontWeight: 600, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
      }}>
        Search Ward
      </div>

      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        border: open ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
        borderRadius: open && suggestions.length > 0 ? '8px 8px 0 0' : '8px',
        background: '#f8fafc',
        transition: 'border-color 0.15s',
        overflow: 'hidden',
      }}>
        {/* Search icon */}
        <span style={{ paddingLeft: '10px', color: '#94a3b8', fontSize: '14px', flexShrink: 0, lineHeight: 1 }}>
          ⌕
        </span>

        <input
          ref={inputRef}
          value={query}
          placeholder="Search wards…"
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          onKeyDown={onKeyDown}
          style={{
            flex: 1,
            border: 'none', outline: 'none', background: 'transparent',
            padding: '8px 6px', fontSize: '13px', color: '#0f172a',
            minWidth: 0,
          }}
        />

        {/* Clear button */}
        {hasValue && (
          <button
            onPointerDown={e => { e.preventDefault(); clear(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 10px', color: '#94a3b8', fontSize: '14px',
              display: 'flex', alignItems: 'center', flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0, right: 0,
          background: '#ffffff',
          border: '1.5px solid #6366f1',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          zIndex: 2000,
          overflow: 'hidden',
        }}>
          {suggestions.map((ward, i) => {
            const isActive = i === activeIdx;
            const isSelected = ward === activeWardName;
            return (
              <div
                key={ward}
                onPointerDown={e => { e.preventDefault(); select(ward); }}
                onPointerEnter={() => setActiveIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  background: isActive ? '#eef2ff' : '#ffffff',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.08s',
                }}
              >
                <span style={{ fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>
                  {isSelected ? '✓' : '⌕'}
                </span>
                <span style={{ fontSize: '13px', color: '#0f172a', flex: 1 }}>
                  {highlight(ward, query)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {open && query.trim().length > 0 && suggestions.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '100%', left: 0, right: 0,
          background: '#ffffff',
          border: '1.5px solid #6366f1',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 8px 8px',
          padding: '10px 12px',
          fontSize: '13px', color: '#94a3b8',
          zIndex: 2000,
        }}>
          No wards found
        </div>
      )}
    </div>
  );
}
