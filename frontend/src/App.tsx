import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import { useChatStore } from './store/chatStore';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat');
  const { documents, error } = useChatStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Desktop Docs Chat</h1>
        </div>
        
        <nav className="flex-1 p-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${
              activeTab === 'chat'
                ? 'bg-primary-50 text-primary-600 border border-primary-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💬 Chat
          </button>
          
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${
              activeTab === 'documents'
                ? 'bg-primary-50 text-primary-600 border border-primary-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📚 Documents ({documents.length})
          </button>
        </nav>
        
        {error && (
          <div className="p-3 m-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          Desktop RAG Chat v1.0.0
        </div>
      </div>
      
      <main className="flex-1 flex flex-col">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'documents' && <DocumentManager />}
      </main>
    </div>
  );
}

export default App;