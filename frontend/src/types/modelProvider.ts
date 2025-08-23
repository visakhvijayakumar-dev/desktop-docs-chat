// FILE LOCATION: frontend/src/types/modelProvider.ts
// TypeScript interfaces for the ModelProviderSelector

export interface Model {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  isDefault: boolean;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  models: Model[];
}

export interface ModelProviderSelectorProps {
  onSelectionChange?: (provider: Provider | null, model: Model | null) => void;
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}
