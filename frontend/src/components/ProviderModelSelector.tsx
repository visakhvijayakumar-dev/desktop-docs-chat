import { useEffect } from 'react';
import { ProviderSelector } from './ProviderSelector';
import { ModelSelector } from './ModelSelector';
import {
  useProviderStore,
  useAvailableProviders,
  useAvailableModels,
  useSelectedProvider,
  useSelectedModel,
  useProviderLoadingState,
  useProviderError
} from '../store/providerStore';

interface ProviderModelSelectorProps {
  className?: string;
  compact?: boolean;
  showLabels?: boolean;
}

export const ProviderModelSelector = ({
  className = '',
  compact = false,
  showLabels = true
}: ProviderModelSelectorProps) => {
  const {
    fetchProviders,
    selectProvider,
    selectModel,
    clearError
  } = useProviderStore();

  const providers = useAvailableProviders();
  const models = useAvailableModels();
  const selectedProvider = useSelectedProvider();
  const selectedModel = useSelectedModel();
  const loadingState = useProviderLoadingState();
  const error = useProviderError();
  
  const isLoading = loadingState === 'loading';
  const isError = loadingState === 'error';

  // Fetch providers on mount
  useEffect(() => {
    if (loadingState === 'idle') {
      fetchProviders();
    }
  }, [fetchProviders, loadingState]);

  const handleProviderChange = (providerId: string) => {
    clearError();
    selectProvider(providerId);
  };

  const handleModelChange = (modelId: string) => {
    clearError();
    selectModel(modelId);
  };

  const handleRetry = () => {
    clearError();
    fetchProviders();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && isError) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                Failed to load providers
              </h4>
              <p className="text-sm text-red-600 mt-1">
                {error.message}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleRetry}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const containerClasses = compact 
    ? 'flex space-x-4 items-end'
    : 'space-y-4';

  const selectorClasses = compact ? 'flex-1' : 'w-full';

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Provider Selection */}
      <div className={selectorClasses}>
        {showLabels && (
          <label 
            id="provider-label" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            AI Provider
            {isLoading && (
              <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
            )}
          </label>
        )}
        <ProviderSelector
          providers={providers}
          selectedProvider={selectedProvider}
          onProviderSelect={handleProviderChange}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Model Selection */}
      <div className={selectorClasses}>
        {showLabels && (
          <label 
            id="model-label" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Model
            {selectedProvider && (
              <span className="ml-2 text-xs text-gray-500">
                ({models.length} available)
              </span>
            )}
          </label>
        )}
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelSelect={handleModelChange}
          disabled={!selectedProvider || isLoading}
          placeholder={!selectedProvider ? 'Select a provider first' : 'Select a model...'}
          className="w-full"
        />
      </div>

      {/* Selection Summary (for compact mode) */}
      {compact && selectedProvider && selectedModel && (
        <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          {selectedProvider.name} • {selectedModel.name}
        </div>
      )}

      {/* Error Display */}
      {error && error.code !== 'FETCH_ERROR' && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error.message}
        </div>
      )}
    </div>
  );
};

// Export a hook for getting current selection for use in other components
export const useCurrentProviderModel = () => {
  const selectedProvider = useSelectedProvider();
  const selectedModel = useSelectedModel();
  
  return {
    provider: selectedProvider,
    model: selectedModel,
    providerId: selectedProvider?.id || null,
    modelId: selectedModel?.id || null,
    isReady: !!(selectedProvider && selectedModel)
  };
};