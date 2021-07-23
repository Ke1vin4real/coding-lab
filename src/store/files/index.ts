import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface file {
  name: string,
  type: 'file' | 'folder',
  content?: string,
}

export interface files {
  [propName: string]: file,
}

const initialState = {
  filesMap: {
    '/index.ts': { type: 'file', name: 'index.ts' },
    '/index.css': { type: 'file', name: 'index.css' },
    '/A': { type: 'folder', name: 'A' },
    '/a': { type: 'folder', name: 'a' },
    '/test2/test3': { type: 'folder', name: 'test3' },
    '/test2/test3/index.css': { type: 'file', name: 'index.css' },
    '/test2/test3/test4': { type: 'folder', name: 'test4' },
    '/test2/test3/test4/index.js': { type: 'file', name: 'index.js' },
    '/test': { type: 'folder', name: 'test' },
    '/test/haha.css': { type: 'file', name: 'haha.css' },
    '/test/test': { type: 'folder', name: 'test' },
    '/test/test/aaa.ts': { type: 'file', name: 'aaa.ts' },
    '/test/test/index.js': { type: 'file', name: 'index.js' },
    '/test2': { type: 'folder', name: 'test2' },
  },
} as { filesMap: files };

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    initialFiles: (state, action: PayloadAction<files>) => {
      const files = action.payload;
      const { filesMap } = state;
      const originalPaths = Object.keys(filesMap);

      if (originalPaths.length === 0) {
        state.filesMap = { ...files };
      }
    },
    updateFileContent: (state, action: PayloadAction<{ path: string, content: string }>) => {
      const { path, content } = action.payload;
      const { filesMap } = state;

      const file = filesMap[path];

      if (file) {
        state.filesMap = {
          ...filesMap,
          [path]: { ...file, content }
        };
      }
    },
    addFiles: (state, action: PayloadAction<files>) => {
      const files = action.payload;
      const paths = Object.keys(files);
      const { filesMap } = state;

      if (paths.length) {
        const isParamValid = !paths.some((path) => Boolean(filesMap[path]));

        if (isParamValid) {
          state.filesMap = { ...filesMap, ...files };
        }
      }
    },
    deleteFiles: (state, action: PayloadAction<string[]>) => {
      const paths = action.payload;
      const { filesMap } = state;

      if (paths.length) {
        const isParamValid = !paths.some((path) => Boolean(filesMap[path]));

        if (isParamValid) {
          paths.forEach((path) => {
            delete filesMap[path];
          });

          state.filesMap = { ...filesMap };
        }
      }
    },
  }
});

export default filesSlice.reducer;