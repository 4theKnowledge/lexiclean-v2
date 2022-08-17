import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null,
  preferences: {},
  token: null,
  isAuthenticated: false
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setIsAuthenicated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setLogin: (state, action) => {
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.isAuthenticated = action.payload.authenticated;
    },
    logout: (state) => {
      // https://stackoverflow.com/questions/59061161/how-to-reset-state-of-redux-store-when-using-configurestore-from-reduxjs-toolki
      // From here we can take action only at this "counter" state
      // But, as we have taken care of this particular "logout" action
      // in rootReducer, we can use it to CLEAR the complete Redux Store's state
    },
  },
});

export const { setUsername, setToken, logout, setLogin, setIsAuthenticated } = userSlice.actions;

export const selectUsername = (state) => state.user.username;
export const selectToken = (state) => state.user.token;
export const selectIsAuthenticated = (state) => state.user.isAuthenicated

export default userSlice.reducer;
