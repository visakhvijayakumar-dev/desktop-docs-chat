import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  chat: {
    sendMessage: (message: string) => ipcRenderer.invoke('chat:send-message', message),
    uploadDocument: (filePath: string) => ipcRenderer.invoke('chat:upload-document', filePath)
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;