'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';

interface SearchableSelectProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; name: string }[];
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  className = '',
  disabled = false,
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync search input with selected value
  useEffect(() => {
    const selected = options.find((o) => o.id === value);
    setSearch(selected ? selected.name : '');
  }, [value, options]);

  // Click outside listener
  useEffect(() => {
    if (disabled) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selected = options.find((o) => o.id === value);
        setSearch(selected ? selected.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options, disabled]);

  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [search, options]);

  return (
    <div className={`flex flex-col gap-1.5 relative w-full ${className}`} ref={containerRef}>
      {label && <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">{label}</label>}
      <div className="relative w-full">
        <input
          type="text"
          value={search}
          placeholder={placeholder}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={(e) => {
            if (disabled) return;
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange('');
            }
          }}
          disabled={disabled}
          className={`w-full bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua ${
            disabled ? 'bg-bg/40 opacity-70 cursor-not-allowed select-none' : ''
          }`}
        />
        {search && !disabled && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer flex items-center justify-center"
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border-2 border-ink rounded-xl shadow-[3px_4px_0_#0d3a52] max-h-48 overflow-y-auto z-50 flex flex-col">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-ink-3 text-center">No options found</div>
          ) : (
            filteredOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setSearch(o.name);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-aqua-pale text-ink transition-colors cursor-pointer border-b border-ink/5 last:border-0 ${
                  o.id === value ? 'bg-aqua-sky/20 font-bold' : ''
                }`}
              >
                {o.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
