import { KeyboardEvent } from 'react';
import { useChatStore } from '../store/chatStore';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ value, onChange, disabled }: MessageInputProps) => {
  const { sendMessage } = useChatStore();

  const handleSubmit = async () => {
    if (!value.trim() || disabled) return;
    
    const message = value.trim();
    onChange('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          className="input-field resize-none"
          rows={3}
          disabled={disabled}
        />
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="button-primary flex items-center space-x-2"
      >
        <span>Send</span>
        <span>↗️</span>
      </button>
    </div>
  );
};

export default MessageInput;