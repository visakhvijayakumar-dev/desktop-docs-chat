// FILE LOCATION: frontend/src/store/providerStore.ts
// OPTION B: Replace your current providerStore.ts with this version that uses dummy data

import { create } from "zustand";
import {
  Provider,
  Model,
  ProviderSelection,
  ProvidersResponse,
  LoadingState,
  ProviderError,
} from "../types/providers";

// Hardcoded dummy data - same as in ModelProviderSelector
const DUMMY_PROVIDERS: Provider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Advanced AI models with safety focus",
    isEnabled: true,
    models: [
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        description: "Latest Claude model with enhanced capabilities",
        maxTokens: 4000000,
        isDefault: true,
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Balanced performance and efficiency",
        maxTokens: 200000,
        isDefault: false,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        description: "Most capable model for complex tasks",
        maxTokens: 200000,
        isDefault: false,
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        description: "Fast and efficient for simple tasks",
        maxTokens: 200000,
        isDefault: false,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models and advanced AI capabilities",
    isEnabled: true,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Most capable GPT model",
        maxTokens: 128000,
        isDefault: true,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Efficient and cost-effective",
        maxTokens: 128000,
        isDefault: false,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Enhanced GPT-4 with better performance",
        maxTokens: 128000,
        isDefault: false,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Fast and reliable chat model",
        maxTokens: 16385,
        isDefault: false,
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    description: "Gemini models with multimodal capabilities",
    isEnabled: true,
    models: [
      {
        id: "gemini-2.0-flash-exp",
        name: "Gemini 2.0 Flash",
        description: "Latest Gemini model with enhanced speed",
        maxTokens: 1000000,
        isDefault: true,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Advanced reasoning and long context",
        maxTokens: 2000000,
        isDefault: false,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Fast and efficient processing",
        maxTokens: 1000000,
        isDefault: false,
      },
    ],
  },
  {
    id: "ibm",
    name: "IBM Granite",
    description: "Enterprise-focused AI models",
    isEnabled: true,
    models: [
      {
        id: "ibm/granite-3-3-8b-instruct",
        name: "Granite 3.0 8B Instruct",
        description: "Instruction-tuned model for various tasks",
        maxTokens: 8192,
        isDefault: true,
      },
      {
        id: "ibm/granite-3-2b-instruct",
        name: "Granite 3.0 2B Instruct",
        description: "Lightweight instruction model",
        maxTokens: 8192,
        isDefault: false,
      },
      {
        id: "ibm/granite-3-8b-base",
        name: "Granite 3.0 8B Base",
        description: "Base model for fine-tuning",
        maxTokens: 8192,
        isDefault: false,
      },
    ],
  },
];

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
  loadingState: "idle",
  error: null,

  fetchProviders: async () => {
    const { loadingState } = get();

    // Prevent duplicate requests
    if (loadingState === "loading") return;

    set({ loadingState: "loading", error: null });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use hardcoded dummy data instead of API call
      const data: ProvidersResponse = {
        providers: DUMMY_PROVIDERS,
        defaultSelection: {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
        },
      };

      // Set up default selections
      let defaultProvider: Provider | null = null;
      let defaultModel: Model | null = null;

      if (data.defaultSelection) {
        defaultProvider =
          data.providers.find(
            (p) => p.id === data.defaultSelection?.providerId
          ) || null;
        if (defaultProvider) {
          defaultModel =
            defaultProvider.models.find(
              (m) => m.id === data.defaultSelection?.modelId
            ) || null;
        }
      }

      // Fallback to first enabled provider and its first/default model
      if (!defaultProvider) {
        defaultProvider = data.providers.find((p) => p.isEnabled) || null;
        if (defaultProvider) {
          defaultModel =
            defaultProvider.models.find((m) => m.isDefault) ||
            defaultProvider.models[0] ||
            null;
        }
      }

      console.log("🔥 STORE: Loaded providers with defaults:", {
        provider: defaultProvider?.name,
        model: defaultModel?.name,
      });

      set({
        providers: data.providers,
        selectedProvider: defaultProvider,
        selectedModel: defaultModel,
        loadingState: "success",
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch providers";
      set({
        loadingState: "error",
        error: {
          message: errorMessage,
          code: "FETCH_ERROR",
        },
      });
    }
  },

  selectProvider: (providerId: string) => {
    const { providers } = get();
    const provider = providers.find((p) => p.id === providerId && p.isEnabled);

    if (!provider) {
      set({
        error: {
          message: "Provider not found or not enabled",
          code: "INVALID_PROVIDER",
        },
      });
      return;
    }

    // Auto-select the default model for this provider, or the first one
    const defaultModel =
      provider.models.find((m) => m.isDefault) || provider.models[0];

    console.log(
      "🔥 STORE: Provider changed to:",
      provider.name,
      "Model:",
      defaultModel?.name
    );

    set({
      selectedProvider: provider,
      selectedModel: defaultModel,
      error: null,
    });
  },

  selectModel: (modelId: string) => {
    const { selectedProvider } = get();

    if (!selectedProvider) {
      set({
        error: {
          message: "No provider selected",
          code: "NO_PROVIDER_SELECTED",
        },
      });
      return;
    }

    const model = selectedProvider.models.find((m) => m.id === modelId);

    if (!model) {
      set({
        error: {
          message: "Model not found in selected provider",
          code: "INVALID_MODEL",
        },
      });
      return;
    }

    console.log("🔥 STORE: Model changed to:", model.name);

    set({
      selectedModel: model,
      error: null,
    });
  },

  setProviderModel: (providerId: string, modelId: string) => {
    const { providers } = get();
    const provider = providers.find((p) => p.id === providerId && p.isEnabled);

    if (!provider) {
      set({
        error: {
          message: "Provider not found or not enabled",
          code: "INVALID_PROVIDER",
        },
      });
      return;
    }

    const model = provider.models.find((m) => m.id === modelId);

    if (!model) {
      set({
        error: {
          message: "Model not found in provider",
          code: "INVALID_MODEL",
        },
      });
      return;
    }

    console.log("🔥 STORE: Set provider/model to:", provider.name, model.name);

    set({
      selectedProvider: provider,
      selectedModel: model,
      error: null,
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
      loadingState: "idle",
      error: null,
    });
  },
}));

// Selector hooks for specific state slices
export const useProviders = () => useProviderStore((state) => state.providers);
export const useSelectedProvider = () =>
  useProviderStore((state) => state.selectedProvider);
export const useSelectedModel = () =>
  useProviderStore((state) => state.selectedModel);
export const useProviderLoadingState = (): LoadingState =>
  useProviderStore((state) => state.loadingState);
export const useProviderError = () => useProviderStore((state) => state.error);

// Computed selectors
export const useAvailableProviders = () =>
  useProviderStore((state) =>
    state.providers.filter((provider) => provider.isEnabled)
  );

export const useAvailableModels = () =>
  useProviderStore((state) => state.selectedProvider?.models || []);

export const useCurrentSelection = (): ProviderSelection =>
  useProviderStore((state) => ({
    providerId: state.selectedProvider?.id || null,
    modelId: state.selectedModel?.id || null,
  }));
