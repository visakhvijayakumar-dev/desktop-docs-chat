import { create } from 'zustand';
import { useProviderStore } from './providerStore';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  path: string;
  uploadedAt: Date;
}

interface ChatState {
  messages: Message[];
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  removeDocument: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
  uploadDocument: (filePath: string, fileName: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  documents: [],
  isLoading: false,
  error: null,

  addMessage: (content, role) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date()
    };
    set(state => ({ messages: [...state.messages, message] }));
  },

  addDocument: (document) => {
    const newDoc: Document = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: new Date()
    };
    set(state => ({ documents: [...state.documents, newDoc] }));
  },

  removeDocument: (id) => {
    set(state => ({ 
      documents: state.documents.filter(doc => doc.id !== id) 
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (content) => {
    const { addMessage, setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      addMessage(content, 'user');
      
      // Get current provider and model selection
      const providerState = useProviderStore.getState();
      const providerId = providerState.selectedProvider?.id || null;
      const modelId = providerState.selectedModel?.id || null;
      
      if (!providerId || !modelId) {
        throw new Error('Please select an AI provider and model before sending a message');
      }
      
      const response = await window.electronAPI.chat.sendMessage({
        message: content,
        providerId,
        modelId
      });
      
      if (response?.message) {
        addMessage(response.message, 'assistant');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`Error: ${errorMessage}`, 'assistant');
    } finally {
      setLoading(false);
    }
  },

  uploadDocument: async (filePath, fileName) => {
    const { addDocument, setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      await window.electronAPI.chat.uploadDocument(filePath);
      
      addDocument({
        name: fileName,
        path: filePath
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }
}));