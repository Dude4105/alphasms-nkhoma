import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Select...", disabled = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          border: `1px solid ${isOpen ? 'var(--primary-gold)' : 'var(--glass-border)'}`,
          color: value ? 'var(--text-light)' : 'var(--text-muted)', 
          padding: '0.65rem 0.85rem', 
          borderRadius: '8px',
          fontSize: '0.9rem', 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          paddingRight: '1rem'
        }}>
          {value || placeholder}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-muted)',
            flexShrink: 0
          }} 
        />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: 'calc(100% + 5px)', 
          left: 0, 
          right: 0, 
          background: 'rgba(20, 20, 20, 0.95)', 
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          zIndex: 100000,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Search size={14} style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  width: '100%',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <X 
                  size={14} 
                  onClick={() => setSearchTerm('')}
                  style={{ marginRight: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }} 
                />
              )}
            </div>
          </div>

          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div 
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{ 
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    color: value === option ? 'var(--primary-gold)' : 'var(--text-light)',
                    background: value === option ? 'rgba(253, 184, 19, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontWeight: value === option ? 600 : 400 }}>{option}</span>
                  {value === option && <Check size={14} />}
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
