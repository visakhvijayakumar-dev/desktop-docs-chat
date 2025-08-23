import React from 'react';
import ChatInterface from './components/ChatInterface';
import './styles/app.css';

/**
 * Root application component.
 * Renders the main chat interface which includes provider and model selection.
 */
const App: React.FC = () => {
  return <ChatInterface />;
};

export default App;

