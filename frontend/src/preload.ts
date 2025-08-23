import { contextBridge, ipcRenderer } from 'electron';

interface ChatMessage {
  message: string;
  providerId: string;
  modelId: string;
}

const electronAPI = {
  chat: {
    sendMessage: (messageData: ChatMessage) => ipcRenderer.invoke('chat:send-message', messageData),
    uploadDocument: (filePath: string) => ipcRenderer.invoke('chat:upload-document', filePath)
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;