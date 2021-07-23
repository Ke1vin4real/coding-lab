import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import filesSlice from "./files";

export const store = configureStore({
  reducer: {
    files: filesSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
  >;