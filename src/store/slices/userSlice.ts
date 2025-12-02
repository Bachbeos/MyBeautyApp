import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  token: string | null;
  roleId?: number | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  phone: null,
  avatar: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      Object.assign(state, action.payload);
    },
    clearUser(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
