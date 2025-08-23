interface Model {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
  supportsFunctions?: boolean;
  isDefault?: boolean;
}

interface Provider {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  models: Model[];
}

interface ProviderSelection {
  providerId: string | null;
  modelId: string | null;
}

interface ProvidersResponse {
  providers: Provider[];
  defaultSelection?: ProviderSelection;
}

class ProviderService {
  private providers: Provider[] = [
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude family of models for conversational AI',
      isEnabled: true,
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Most capable model for complex reasoning and analysis',
          maxTokens: 200000,
          supportsFunctions: true,
          isDefault: true
        },
        {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku',
          description: 'Fastest model for quick responses',
          maxTokens: 200000,
          supportsFunctions: true
        },
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful model for complex tasks',
          maxTokens: 200000,
          supportsFunctions: true
        }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models for natural language processing',
      isEnabled: true,
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description: 'Latest multimodal flagship model',
          maxTokens: 128000,
          supportsFunctions: true
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Affordable and intelligent small model',
          maxTokens: 128000,
          supportsFunctions: true
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'High-performance model with vision capabilities',
          maxTokens: 128000,
          supportsFunctions: true
        }
      ]
    },
    {
      id: 'google',
      name: 'Google',
      description: 'Gemini models for multimodal AI tasks',
      isEnabled: true,
      models: [
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Advanced reasoning and code generation',
          maxTokens: 2097152,
          supportsFunctions: true
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient model',
          maxTokens: 1048576,
          supportsFunctions: true
        }
      ]
    },
    {
      id: 'ibm',
      name: 'IBM',
      description: 'Granite models for enterprise applications',
      isEnabled: false, // Disabled by default as it requires special setup
      models: [
        {
          id: 'granite-3.0-8b-instruct',
          name: 'Granite 3.0 8B Instruct',
          description: 'Enterprise-focused instruction-following model',
          maxTokens: 4096,
          supportsFunctions: false
        },
        {
          id: 'granite-3.0-2b-instruct',
          name: 'Granite 3.0 2B Instruct',
          description: 'Lightweight enterprise model',
          maxTokens: 4096,
          supportsFunctions: false
        }
      ]
    }
  ];

  private defaultSelection: ProviderSelection = {
    providerId: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022'
  };

  getAllProvidersAndModels(): ProvidersResponse {
    return {
      providers: this.providers,
      defaultSelection: this.defaultSelection
    };
  }

  getAvailableProviders(): Provider[] {
    return this.providers.filter(provider => provider.isEnabled);
  }

  getProvider(providerId: string): Provider | undefined {
    return this.providers.find(provider => provider.id === providerId);
  }

  getModelsForProvider(providerId: string): Model[] {
    const provider = this.getProvider(providerId);
    return provider ? provider.models : [];
  }

  isValidProviderModel(providerId: string, modelId: string): boolean {
    const provider = this.getProvider(providerId);
    if (!provider || !provider.isEnabled) return false;
    
    return provider.models.some(model => model.id === modelId);
  }

  getDefaultModel(providerId: string): Model | undefined {
    const provider = this.getProvider(providerId);
    if (!provider) return undefined;
    
    return provider.models.find(model => model.isDefault) || provider.models[0];
  }
}

export const providerService = new ProviderService();
export type { Provider, Model, ProvidersResponse, ProviderSelection };