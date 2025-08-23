import { useChatStore } from '../store/chatStore';

const DocumentManager = () => {
  const { documents, removeDocument, uploadDocument, isLoading } = useChatStore();

  const handleFileUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.pdf,.doc,.docx,.md';
      input.multiple = true;
      
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files) return;

        for (const file of Array.from(files)) {
          await uploadDocument(file.path, file.name);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('File upload error:', error);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
        <button
          onClick={handleFileUpload}
          disabled={isLoading}
          className="button-primary flex items-center space-x-2"
        >
          <span>📄</span>
          <span>Upload Documents</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {documents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Documents Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Upload documents to start building your knowledge base. 
                Supported formats: TXT, PDF, DOC, DOCX, MD
              </p>
              <button
                onClick={handleFileUpload}
                className="button-primary"
                disabled={isLoading}
              >
                Upload Your First Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{doc.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Uploaded {doc.uploadedAt.toLocaleDateString()} at{' '}
                      {doc.uploadedAt.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {doc.path}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove document"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="text-sm text-gray-600 text-center">
          {documents.length} document{documents.length !== 1 ? 's' : ''} in your knowledge base
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;