export interface Model {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
  supportsFunctions?: boolean;
  isDefault?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  models: Model[];
}

export interface ProviderModels {
  [providerId: string]: Model[];
}

export interface ProviderSelection {
  providerId: string | null;
  modelId: string | null;
}

export interface ProvidersResponse {
  providers: Provider[];
  defaultSelection?: ProviderSelection;
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success';

export interface ProviderError {
  message: string;
  code?: string;
  details?: string;
}