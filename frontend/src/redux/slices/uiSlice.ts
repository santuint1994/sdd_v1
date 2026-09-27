import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  isSidebarOpen: boolean;
  isGlobalLoading: boolean;
}

const initialState: UiState = {
  isSidebarOpen: true,
  isGlobalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.isGlobalLoading = action.payload;
    },
  },
});

export const { setSidebarOpen, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
