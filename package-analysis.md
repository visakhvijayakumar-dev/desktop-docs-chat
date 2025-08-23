# Codebase Cleanup Analysis

## 📊 Current State
- **Total Size**: 653MB
- **Primary Consumer**: Frontend (547MB - 83% of total)
- **Secondary**: Backend (67MB), Pixel-chat-app (39MB)

## 🎯 Space Breakdown

### Frontend (547MB)
- **node_modules**: 546MB
  - Electron binaries: ~212MB
  - TypeScript/ESLint tooling: ~15MB
  - Build tools (Vite, Rollup): ~8MB
  - Other dependencies: ~311MB

### Backend (67MB) 
- **node_modules**: 67MB
  - AI SDKs (Anthropic, OpenAI, Google): ~15MB
  - Web streams polyfill: 8.7MB
  - Express & utilities: ~43MB

### Pixel-chat-app (39MB)
- **node_modules**: 39MB
  - Minimal React + Vite setup
  - Clean and optimized

## 🗑️ Cleanup Opportunities

### High Impact (500MB+ savings)
1. **Remove all node_modules**: Reinstall only when needed
2. **Remove Electron binaries**: 212MB saved, reinstall with `npm install electron`

### Medium Impact (1-10MB each)
1. **Build artifacts**: dist/, out/, release/ folders
2. **Large dev tools**: TypeScript compiler caches, ESLint caches

### Low Impact (KB-MB)
1. **System files**: .DS_Store, *.log, *.tmp files
2. **Duplicate configs**: Multiple .gitignore files

## 🚨 Potentially Unused Dependencies

### Frontend
- `zustand` (4.4.1) - State management library not imported in main App.tsx
- `tailwindcss` (3.3.3) - CSS framework not used in pixel-style app
- `autoprefixer`, `postcss` - Only needed with Tailwind

### Recommendations
1. **Remove Tailwind ecosystem** from frontend if using pixel-style design
2. **Verify Zustand usage** - remove if state management not needed
3. **Keep backend dependencies** - all appear to be actively used

## 📝 Cleanup Scripts

### `cleanup.sh` - Full Cleanup (600MB+ savings)
- Removes all node_modules directories
- Removes all build artifacts
- Cleans system and temp files
- **Requires**: `npm install` in each project after cleanup

### `selective-cleanup.sh` - Conservative Cleanup (220MB+ savings)  
- Preserves node_modules for faster development
- Removes only Electron binaries and build artifacts
- Cleans system files
- **Requires**: Only `npm install electron` in frontend

## 🔄 Post-Cleanup Commands

After full cleanup:
```bash
cd frontend && npm install
cd ../backend && npm install  
cd ../pixel-chat-app && npm install
```

After selective cleanup:
```bash
cd frontend && npm install electron
```

## ✅ Safe to Remove
- All `/dist`, `/out`, `/release` directories
- Electron binaries in node_modules
- .DS_Store, *.log, *.tmp files
- Build caches and temporary files

## ⚠️ Preserve  
- Source code in `/src` directories
- Configuration files (package.json, tsconfig.json, etc.)
- Root .gitignore and README files
- Environment files (.env templates)