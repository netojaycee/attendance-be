import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a TypeScript interface for user data returned by your backend
export interface User {
  id: string;
  full_name: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "USER" | "ADMIN";
  // created_at: Date;
  // updated_at: Date;
  profile_image?: string | null;
  is_verified: boolean;
  verification_code?: string | null;
}

interface UserState {
  id: string;
  full_name: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "USER" | "ADMIN";
  // created_at: string;
  // updated_at: string;
  profile_image?: string | null;
  is_verified: boolean;
  verification_code?: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: "",
  full_name: "",
  email: "",
  first_name: "",
  last_name: "",
  role: "USER",
  // created_at: new Date(),
  // updated_at: new Date(),
  profile_image: "",
  is_verified: false,
  verification_code: "",
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user_pot",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.full_name = `${action.payload.first_name} ${action.payload.last_name}`;
      state.role = action.payload.role;
      // state.created_at = action.payload.created_at;
      // state.created_at = new Date(action.payload.created_at);
      // state.updated_at = new Date(action.payload.updated_at);
      state.profile_image = action.payload.profile_image;
      state.is_verified = action.payload.is_verified ?? false;
      state.verification_code = action.payload.verification_code || "";
      state.isAuthenticated = true;
    },

    clearUserInfo: () => {
      return { ...initialState };
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;

export default userSlice.reducer;
