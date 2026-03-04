import { createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  requestRegisterOtp,
  userLogin,
  userRegister,
  verifyRegisterOtp,
} from "./authActions";

const token = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : null;

const initialState = {
  loading: false,
  user: null,
  token,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    // login user
    builder.addCase(userLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(userLogin.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload.user;
      state.token = payload.token;
    });
    builder.addCase(userLogin.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
    // REGISTER user
    builder.addCase(userRegister.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(userRegister.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload.user;
    });
    builder.addCase(userRegister.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
    // REGISTER OTP request
    builder.addCase(requestRegisterOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(requestRegisterOtp.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(requestRegisterOtp.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
    // REGISTER OTP verify
    builder.addCase(verifyRegisterOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyRegisterOtp.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(verifyRegisterOtp.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
    // CURRENT user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload.user;
    });
    builder.addCase(getCurrentUser.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
  },
});

export default authSlice;
