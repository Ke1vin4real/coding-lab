import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'

interface file {
  name: string,
  type: 'file' | 'folder',
  content: string | null,
}

export interface files {
  [propName: string]: file,
}

const initialState = {
  filesMap: {
    '/index.ts': { type: 'file', name: 'index.ts', content: '' },
    '/index.css': { type: 'file', name: 'index.css', content: '' },
    '/A': { type: 'folder', name: 'A', content: null },
    '/a': { type: 'folder', name: 'a', content: null },
    '/test2/test3': { type: 'folder', name: 'test3', content: null },
    '/test2/test3/index.css': { type: 'file', name: 'index.css', content: '' },
    '/test2/test3/test4': { type: 'folder', name: 'test4', content: null },
    '/test2/test3/test4/b.js': { type: 'file', name: 'b.js', content: '' },
    '/test2/test3/test4/a.js': { type: 'file', name: 'a.js', content: '' },
    '/test2/test3/test4/index.js': { type: 'file', name: 'index.js', content: '' },
    '/test': { type: 'folder', name: 'test', content: null },
    '/test/haha.css': { type: 'file', name: 'haha.css', content: '' },
    '/test/test': { type: 'folder', name: 'test', content: null },
    '/test/test/aaa.ts': { type: 'file', name: 'aaa.ts', content: '' },
    '/test/test/index.js': { type: 'file', name: 'index.js', content: '' },
    '/test2': { type: 'folder', name: 'test2', content: null },
  },
} as { filesMap: files };

export const deleteFolder = createAsyncThunk(
  'files/deleteFolder',
  async (arg: string[]) => {
    return arg;
  },
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (arg: string) => {
    return arg;
  },
);

export const renameFile = createAsyncThunk(
  'files/renameFile',
  async (arg: { originPathname: string, newPathname: string, newFilename: string }) => {
    return arg;
  },
);

export const renameFolder = createAsyncThunk(
  'files/renameFolder',
  async (arg: { originPathname: string, newPathname: string, newFolderName: string, childPaths: { _originPathname: string, _newPathname: string }[] }) => {
    return arg;
  },
);

export const addFile = createAsyncThunk(
  'files/addFile',
  async (arg: { name: string, path: string, content?: string }) => {
    return arg;
  },
);

export const addFolder = createAsyncThunk(
  'files/addFolder',
  async (arg: { name: string, path: string }) => {
    return arg;
  },
);

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

  },
  extraReducers: (builder) => {
    builder
    .addCase(renameFile.fulfilled, (state, action) => {
      const { newPathname, newFilename, originPathname } = action.payload;
      const originNode = state.filesMap[originPathname];
      if (originNode.type === 'folder') return;
      const newFilesMap: files = {
        ...state.filesMap,
        [newPathname]: { type: 'file', name: newFilename, content: originNode.content },
      };

      delete newFilesMap[originPathname];

      state.filesMap = newFilesMap;
    })
    .addCase(renameFolder.fulfilled, (state, action) => {
      const { originPathname, newFolderName, newPathname, childPaths } = action.payload;
      const newFilesMap = { ...state.filesMap };
      const originNode = newFilesMap[originPathname];

      if (originNode.type === 'file') return;

      newFilesMap[newPathname] = { ...originNode, name: newFolderName };

      delete newFilesMap[originPathname];

      childPaths.forEach(({ _originPathname, _newPathname }) => {
        if (newFilesMap[_originPathname]) {
          newFilesMap[_newPathname] = newFilesMap[_originPathname];
          delete newFilesMap[_originPathname];
        }
      });

      state.filesMap = newFilesMap;
    })
    .addCase(deleteFile.fulfilled, (state, action) => {
      const pathname = action.payload;
      const newFileMap = { ...state.filesMap };
      if (!newFileMap[pathname]) return;
      delete newFileMap[pathname];
      state.filesMap = newFileMap;
    })
    .addCase(deleteFolder.fulfilled, (state, action) => {
      const paths = action.payload;
      const newFileMap = { ...state.filesMap };
      if (paths.some((i) => !newFileMap[i])) return;
      paths.forEach((path) => {
        delete newFileMap[path];
      });
      state.filesMap = newFileMap;
    })
    .addCase(addFile.fulfilled, (state, action) => {
      const { content = '', path, name } = action.payload;
      const newFileMap: files = { ...state.filesMap };
      if (newFileMap[path]) return;
      newFileMap[path] = { type: 'file', content, name };
      state.filesMap = newFileMap;
    })
    .addCase(addFolder.fulfilled, (state, action) => {
      const { path, name } = action.payload;
      const newFileMap: files = { ...state.filesMap };
      if (newFileMap[path]) return;
      newFileMap[path] = { type: 'folder', name, content: null };
      state.filesMap = newFileMap;
    });
  }
});

export default filesSlice.reducer;