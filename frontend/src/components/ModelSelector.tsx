import { useState, useRef, useEffect } from 'react';
import { Model } from '../types/providers';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model | null;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ModelSelector = ({
  models,
  selectedModel,
  onModelSelect,
  disabled = false,
  placeholder = 'Select a model...',
  className = ''
}: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleModelSelect = (model: Model) => {
    onModelSelect(model.id);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const formatMaxTokens = (maxTokens?: number): string => {
    if (!maxTokens) return '';
    if (maxTokens >= 1000000) return `${(maxTokens / 1000000).toFixed(1)}M`;
    if (maxTokens >= 1000) return `${(maxTokens / 1000).toFixed(0)}K`;
    return maxTokens.toString();
  };


  if (models.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        {disabled ? 'Select a provider first' : 'No models available'}
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
        aria-labelledby="model-label"
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedModel ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {selectedModel.name}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {selectedModel.description && (
                    <span className="text-xs text-gray-500 truncate">
                      {selectedModel.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {selectedModel.maxTokens && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {formatMaxTokens(selectedModel.maxTokens)}
                  </span>
                )}
                {selectedModel.isDefault && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">{placeholder}</div>
          )}
        </div>
        
        <div className="flex items-center ml-2">
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
          <ul className="py-1" role="listbox" aria-labelledby="model-label">
            {models.map((model) => (
              <li key={model.id} role="option" aria-selected={selectedModel?.id === model.id}>
                <button
                  type="button"
                  className={`
                    w-full px-3 py-2 text-left hover:bg-primary-50
                    focus:bg-primary-50 focus:outline-none
                    ${selectedModel?.id === model.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-900'
                    }
                  `}
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {model.name}
                      </div>
                      {model.description && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {model.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      {model.maxTokens && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {formatMaxTokens(model.maxTokens)}
                        </span>
                      )}
                      {model.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      {model.supportsFunctions && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Functions
                        </span>
                      )}
                      {selectedModel?.id === model.id && (
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
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};