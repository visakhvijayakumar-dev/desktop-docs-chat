import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ProviderModelSelector, useCurrentProviderModel } from './ProviderModelSelector';

const ChatInterface = () => {
  const { messages, isLoading, clearMessages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { provider, model, isReady } = useCurrentProviderModel();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
            {isReady && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 rounded-md">
                  {provider?.name}
                </span>
                <span className="text-gray-400">•</span>
                <span className="font-medium">{model?.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="AI Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={clearMessages}
              className="button-secondary text-sm"
              disabled={messages.length === 0}
            >
              Clear Chat
            </button>
          </div>
        </div>
        
        {/* Provider/Model Selector */}
        {showSettings && (
          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">AI Configuration</h3>
              <ProviderModelSelector compact className="max-w-2xl" />
            </div>
          </div>
        )}
        
        {/* Warning when no provider/model selected */}
        {!isReady && (
          <div className="px-4 pb-4 bg-yellow-50 border-t border-yellow-200">
            <div className="flex items-center space-x-2 text-yellow-800">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Please configure an AI provider and model to start chatting</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to Desktop Docs Chat
              </h3>
              <p className="text-gray-600">
                Upload documents and start asking questions about them. 
                Your documents will be processed using RAG technology for accurate responses.
              </p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Thinking...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          disabled={isLoading || !isReady}
        />
        {!isReady && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Configure AI provider and model to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;