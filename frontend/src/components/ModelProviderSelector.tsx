// FILE LOCATION: frontend/src/components/ModelProviderSelector.tsx
// REPLACE YOUR CURRENT ModelProviderSelector.tsx WITH THIS PIXEL-STYLE VERSION

import React, { useState, useEffect } from "react";
import type {
  Provider,
  Model,
  ModelProviderSelectorProps,
} from "../types/modelProvider";

// Dummy data structure for providers and their models
const DUMMY_PROVIDERS = [
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

export const ModelProviderSelector: React.FC<ModelProviderSelectorProps> = ({
  onSelectionChange,
  className = "",
  showLabels = true,
  compact = false,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  // Initialize with default selections
  useEffect(() => {
    if (DUMMY_PROVIDERS.length > 0) {
      const defaultProvider = DUMMY_PROVIDERS[0]; // Anthropic by default
      const defaultModel =
        defaultProvider.models.find((m) => m.isDefault) ||
        defaultProvider.models[0];

      setSelectedProvider(defaultProvider);
      setSelectedModel(defaultModel);

      if (onSelectionChange) {
        onSelectionChange(defaultProvider, defaultModel);
      }
    }
  }, [onSelectionChange]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerId = e.target.value;
    const provider = DUMMY_PROVIDERS.find((p) => p.id === providerId);

    if (provider) {
      setSelectedProvider(provider);

      // Auto-select default model or first model
      const defaultModel =
        provider.models.find((m) => m.isDefault) || provider.models[0];
      setSelectedModel(defaultModel);

      console.log(
        "Provider changed to:",
        provider.name,
        "Model:",
        defaultModel?.name
      );

      if (onSelectionChange) {
        onSelectionChange(provider, defaultModel);
      }
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;

    if (selectedProvider) {
      const model = selectedProvider.models.find((m) => m.id === modelId);
      if (model) {
        setSelectedModel(model);

        console.log("Model changed to:", model.name);

        if (onSelectionChange) {
          onSelectionChange(selectedProvider, model);
        }
      }
    }
  };

  const formatMaxTokens = (maxTokens: number): string => {
    if (maxTokens >= 1000000) return `${(maxTokens / 1000000).toFixed(1)}M`;
    if (maxTokens >= 1000) return `${(maxTokens / 1000).toFixed(0)}K`;
    return maxTokens.toString();
  };

  return (
    <div className={`provider-selector ${className}`}>
      {/* Provider Selection */}
      <div className="field">
        {showLabels && <div className="label">Provider</div>}
        <select
          value={selectedProvider?.id || ""}
          onChange={handleProviderChange}
          className="provider-select"
        >
          {DUMMY_PROVIDERS.filter((p) => p.isEnabled).map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      {selectedProvider && (
        <div className="field">
          {showLabels && (
            <div className="label">
              Model ({selectedProvider.models.length} available)
            </div>
          )}
          <select
            value={selectedModel?.id || ""}
            onChange={handleModelChange}
            className="model-select"
          >
            {selectedProvider.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
                {model.isDefault ? " (default)" : ""}
                {` • ${formatMaxTokens(model.maxTokens)} tokens`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Selection Display */}
      {selectedProvider && selectedModel && !compact && (
        <div className="current-selection">
          <div className="selection-title">
            Selected: {selectedProvider.name}
          </div>
          <div className="selection-model">{selectedModel.name}</div>
          <div className="selection-details">
            {formatMaxTokens(selectedModel.maxTokens)} tokens
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelProviderSelector;
