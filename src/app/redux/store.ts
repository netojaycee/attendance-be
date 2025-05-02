import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { api } from "./api";
import userReducer from "./slices/userSlice";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  user_pot: userReducer,
});

const persistConfig = {
  key: "root_pot",
  storage,
  // whitelist: ["user"], // Only persist the user slice (add more slice keys if needed)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);

setupListeners(store.dispatch);
