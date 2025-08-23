import { useState, useRef, useEffect } from 'react';
import { Provider } from '../types/providers';

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  onProviderSelect: (providerId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ProviderSelector = ({
  providers,
  selectedProvider,
  onProviderSelect,
  disabled = false,
  className = ''
}: ProviderSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableProviders = providers.filter(provider => provider.isEnabled);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    onProviderSelect(provider.id);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const getProviderIcon = (providerId: string): string => {
    const icons: { [key: string]: string } = {
      anthropic: '🏛️',
      openai: '🔥',
      google: '🎯',
      ibm: '🏢'
    };
    return icons[providerId] || '🤖';
  };

  if (availableProviders.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No providers available
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-left
          border border-gray-300 rounded-lg shadow-sm bg-white
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-colors duration-200
          ${disabled 
            ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
            : 'hover:border-gray-400 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="provider-label"
      >
        <div className="flex items-center space-x-2">
          {selectedProvider ? (
            <>
              <span className="text-lg">
                {getProviderIcon(selectedProvider.id)}
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedProvider.name}
                </div>
                {selectedProvider.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {selectedProvider.description}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Select a provider...</div>
          )}
        </div>
        
        <div className="flex items-center">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul className="py-1" role="listbox" aria-labelledby="provider-label">
            {availableProviders.map((provider) => (
              <li key={provider.id} role="option" aria-selected={selectedProvider?.id === provider.id}>
                <button
                  type="button"
                  className={`
                    w-full px-3 py-2 text-left hover:bg-primary-50
                    focus:bg-primary-50 focus:outline-none
                    flex items-center space-x-2
                    ${selectedProvider?.id === provider.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-900'
                    }
                  `}
                  onClick={() => handleProviderSelect(provider)}
                >
                  <span className="text-lg">
                    {getProviderIcon(provider.id)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {provider.name}
                    </div>
                    {provider.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {provider.description}
                      </div>
                    )}
                  </div>
                  {selectedProvider?.id === provider.id && (
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};