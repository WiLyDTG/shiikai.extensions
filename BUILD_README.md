# MangaTV Extension Build Process

## Problem
The MangaTV extension was throwing the error:
```
MethodNotImplementedError: Method 'getHomePageSections' does not have a JavaScript implementation
```

Although the method was implemented in the source file, Paperback couldn't find it because the files weren't properly compiled/bundled.

## Solution Implemented

### 1. Build Setup
- Created `package.json` with project configuration
- Installed dependencies:
  - `@paperback/types@1.0.0-alpha.57` - Type definitions and utilities
  - `cheerio@1.0.0-rc.12` - HTML parsing library
  - `webpack` & `webpack-cli` - Module bundler

### 2. Bundling Process
- Created `webpack.config.js` to bundle the extensions in UMD format
- Bundled `source.js` - includes all dependencies (437KB)
- Bundled `index.js` - includes all dependencies (437KB)
- Both files now contain the complete code including:
  - The `getHomePageSections` method (verified present)
  - All required dependencies (cheerio, @paperback/types)
  - Proper UMD wrapper for compatibility

### 3. Updates Made
- Updated `versioning.json` with new buildTime: `2026-02-15T04:40:00.000Z`
- Created `.gitignore` to exclude node_modules and build artifacts
- Preserved original source files as `*.original` for reference (excluded from git)

## Verification
- ✅ Both bundled files are ~437KB (similar to reference repository)
- ✅ Files use UMD format for universal module compatibility
- ✅ `getHomePageSections` method is present in the bundle
- ✅ All dependencies (cheerio, @paperback/types) are bundled inline
- ✅ versioning.json updated with current timestamp

## Files Modified
- `0.8/MangaTV/source.js` - Now a bundled version
- `0.8/MangaTV/index.js` - Now a bundled version  
- `0.8/versioning.json` - Updated buildTime

## Files Added
- `.gitignore` - Excludes build artifacts and dependencies
- `package.json` - Project configuration
- `package-lock.json` - Dependency lock file
- `webpack.config.js` - Build configuration

## How to Rebuild (if needed)
```bash
npm install
npx webpack --config webpack.config.js
```

## Notes
- The bundled files are in UMD (Universal Module Definition) format
- All external dependencies are included in the bundle
- The original source files are preserved as `*.original` (not in git)
- The bundle format matches the requirements shown in the reference repository
