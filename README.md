# Desktop Docs Chat

A local RAG (Retrieval-Augmented Generation) chat application built with Electron, providing private conversations with multiple LLM providers and document retrieval capabilities.

<img width="1196" height="771" alt="image" src="https://github.com/user-attachments/assets/7928c90c-cb37-4e7e-873d-733128facf13" />

## Features

### Phase 1 (Current)
- Multi-provider LLM chat (Anthropic, OpenAI, Gemini, IBM Granite)
- Model selection within each provider
- Secure API key management with system keychain
- Clean, responsive chat interface with dark/light themes
- Streaming responses for supported providers
- Resizable sidebar layout
- Auto-updater integration
- Cross-platform support (Windows, macOS, Linux)
- Minimize to tray functionality
- Custom instructions support

### Phase 2 (Planned)
- Local document ingestion (.txt, .md, later PDF)
- Vector embeddings with LanceDB
- Document search and citation
- Drag-drop file interface
- Local embedding models (sentence-transformers)

## Tech Stack

- **Frontend**: Electron + Vite + React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **State Management**: Zustand
- **Security**: Keytar for secure credential storage
- **AI Providers**: Official SDKs for each provider
- **Future**: LanceDB for vectors, sentence-transformers for embeddings

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/visakhvijayakumar-dev/desktop-docs-chat.git
cd desktop-docs-chat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Start Development
```bash
npm run dev
```

## API Keys Required

Get your API keys from:
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **OpenAI**: [platform.openai.com](https://platform.openai.com)
- **Google Gemini**: [aistudio.google.com](https://aistudio.google.com)
- **IBM Granite**: [bam.res.ibm.com](https://bam.res.ibm.com)

## Project Structure

```
desktop-docs-chat/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI provider services
│   │   └── server.ts       # Main server file
│   └── package.json
├── electron/               # Electron main process
│   ├── main.ts            # Main process
│   └── preload.ts         # Preload script
├── src/                   # React frontend
│   ├── components/        # React components
│   ├── services/          # Frontend services
│   ├── store/            # Zustand store
│   ├── types/            # TypeScript types
│   └── App.tsx           # Main app component
├── dist/                 # Frontend build output
├── dist-electron/        # Electron build output
└── package.json          # Main package.json
```

## Supported Models

**Anthropic**
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Haiku

**OpenAI**
- GPT-4o
- GPT-4 Turbo
- GPT-3.5 Turbo

**Google Gemini**
- Gemini Pro
- Gemini Pro Vision

**IBM Granite**
- Granite 3 8B Instruct
- Granite 3 2B Instruct

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Cmd/Ctrl + ,` - Open settings
- `Cmd/Ctrl + N` - Clear chat
- `Cmd/Ctrl + M` - Minimize to tray (Windows/Linux)

## Building for Production

```bash
# Build everything
npm run build

# Create distributables
npm run dist              # Current platform
npm run dist:mac         # macOS
npm run dist:win         # Windows
npm run dist:linux       # Linux
```

## Development Scripts

- `npm run dev` - Start both backend and frontend
- `npm run dev:electron` - Start only Electron frontend
- `npm run dev:backend` - Start only Express backend
- `npm run build` - Build both frontend and backend
- `npm run pack` - Package without creating installer

## Security Features

- **Secure Storage**: API keys stored in system keychain
- **No Plain Text**: Keys never stored in files
- **Process Isolation**: Electron security best practices
- **Local Processing**: No data sent to external servers (except AI APIs)

## Roadmap

### Phase 2: RAG Implementation
- [ ] Document ingestion pipeline
- [ ] Vector database integration (LanceDB)
- [ ] Local embedding models
- [ ] Semantic search
- [ ] Citation system
- [ ] File management UI

### Phase 3: Advanced Features
- [ ] Export conversations
- [ ] Conversation history
- [ ] Plugin system
- [ ] Advanced search
- [ ] Multiple document collections

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

For issues and questions:
1. Check [existing GitHub issues](https://github.com/visakhvijayakumar-dev/desktop-docs-chat/issues)
2. Create new issue with reproduction steps
3. Include logs and system information

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI powered by [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Secure storage via [Keytar](https://github.com/atom/node-keytar)

---

**Made with care for private, local AI conversations**
