import { create } from 'zustand';
import { Provider, Model, ProviderSelection, ProvidersResponse, LoadingState, ProviderError } from '../types/providers';

interface ProviderState {
  providers: Provider[];
  selectedProvider: Provider | null;
  selectedModel: Model | null;
  loadingState: LoadingState;
  error: ProviderError | null;
  
  // Actions
  fetchProviders: () => Promise<void>;
  selectProvider: (providerId: string) => void;
  selectModel: (modelId: string) => void;
  setProviderModel: (providerId: string, modelId: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  providers: [],
  selectedProvider: null,
  selectedModel: null,
  loadingState: 'idle',
  error: null,

  fetchProviders: async () => {
    const { loadingState } = get();
    
    // Prevent duplicate requests
    if (loadingState === 'loading') return;
    
    set({ loadingState: 'loading', error: null });
    
    try {
      const response = await fetch('http://localhost:3010/api/providers/models');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.status} ${response.statusText}`);
      }
      
      const data: ProvidersResponse = await response.json();
      
      // Set up default selections
      let defaultProvider: Provider | null = null;
      let defaultModel: Model | null = null;
      
      if (data.defaultSelection) {
        defaultProvider = data.providers.find(p => p.id === data.defaultSelection?.providerId) || null;
        if (defaultProvider) {
          defaultModel = defaultProvider.models.find(m => m.id === data.defaultSelection?.modelId) || null;
        }
      }
      
      // Fallback to first enabled provider and its first/default model
      if (!defaultProvider) {
        defaultProvider = data.providers.find(p => p.isEnabled) || null;
        if (defaultProvider) {
          defaultModel = defaultProvider.models.find(m => m.isDefault) || defaultProvider.models[0] || null;
        }
      }
      
      set({
        providers: data.providers,
        selectedProvider: defaultProvider,
        selectedModel: defaultModel,
        loadingState: 'success',
        error: null
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch providers';
      set({
        loadingState: 'error',
        error: {
          message: errorMessage,
          code: 'FETCH_ERROR'
        }
      });
    }
  },

  selectProvider: (providerId: string) => {
    const { providers } = get();
    const provider = providers.find(p => p.id === providerId && p.isEnabled);
    
    if (!provider) {
      set({
        error: {
          message: 'Provider not found or not enabled',
          code: 'INVALID_PROVIDER'
        }
      });
      return;
    }
    
    // Auto-select the default model for this provider, or the first one
    const defaultModel = provider.models.find(m => m.isDefault) || provider.models[0];
    
    set({
      selectedProvider: provider,
      selectedModel: defaultModel,
      error: null
    });
  },

  selectModel: (modelId: string) => {
    const { selectedProvider } = get();
    
    if (!selectedProvider) {
      set({
        error: {
          message: 'No provider selected',
          code: 'NO_PROVIDER_SELECTED'
        }
      });
      return;
    }
    
    const model = selectedProvider.models.find(m => m.id === modelId);
    
    if (!model) {
      set({
        error: {
          message: 'Model not found in selected provider',
          code: 'INVALID_MODEL'
        }
      });
      return;
    }
    
    set({
      selectedModel: model,
      error: null
    });
  },

  setProviderModel: (providerId: string, modelId: string) => {
    const { providers } = get();
    const provider = providers.find(p => p.id === providerId && p.isEnabled);
    
    if (!provider) {
      set({
        error: {
          message: 'Provider not found or not enabled',
          code: 'INVALID_PROVIDER'
        }
      });
      return;
    }
    
    const model = provider.models.find(m => m.id === modelId);
    
    if (!model) {
      set({
        error: {
          message: 'Model not found in provider',
          code: 'INVALID_MODEL'
        }
      });
      return;
    }
    
    set({
      selectedProvider: provider,
      selectedModel: model,
      error: null
    });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      providers: [],
      selectedProvider: null,
      selectedModel: null,
      loadingState: 'idle',
      error: null
    });
  }
}));

// Selector hooks for specific state slices
export const useProviders = () => useProviderStore(state => state.providers);
export const useSelectedProvider = () => useProviderStore(state => state.selectedProvider);
export const useSelectedModel = () => useProviderStore(state => state.selectedModel);
export const useProviderLoadingState = (): LoadingState => useProviderStore(state => state.loadingState);
export const useProviderError = () => useProviderStore(state => state.error);

// Computed selectors
export const useAvailableProviders = () => useProviderStore(state => 
  state.providers.filter(provider => provider.isEnabled)
);

export const useAvailableModels = () => useProviderStore(state => 
  state.selectedProvider?.models || []
);

export const useCurrentSelection = (): ProviderSelection => useProviderStore(state => ({
  providerId: state.selectedProvider?.id || null,
  modelId: state.selectedModel?.id || null
}));