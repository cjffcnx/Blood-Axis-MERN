import axios from "axios";

const configuredBaseUrl =
  process.env.REACT_APP_BASEURL || process.env.REACT_APP_API_URL || "/api/v1";

const normalizedBaseUrl = configuredBaseUrl.endsWith("/")
  ? configuredBaseUrl.slice(0, -1)
  : configuredBaseUrl;

const API = axios.create({ baseURL: normalizedBaseUrl });

API.interceptors.request.use((req) => {
  if (localStorage.getItem("token")) {
    req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }
  return req;
});

export default API;
