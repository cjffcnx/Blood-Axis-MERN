import axios from "axios";

const configuredBaseUrl =
  process.env.REACT_APP_BASEURL || process.env.REACT_APP_API_URL || "/api/v1";

const normalizedBaseUrl = configuredBaseUrl.endsWith("/")
  ? configuredBaseUrl.slice(0, -1)
  : configuredBaseUrl;

const API = axios.create({ baseURL: normalizedBaseUrl });

const toAbsoluteApiBaseUrl = () => {
  if (/^https?:\/\//i.test(normalizedBaseUrl)) {
    return normalizedBaseUrl;
  }

  const prefix = normalizedBaseUrl.startsWith("/") ? "" : "/";
  return `${window.location.origin}${prefix}${normalizedBaseUrl}`;
};

export const buildBackendFileUrl = (filePath) => {
  if (!filePath || typeof filePath !== "string") return "#";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const normalizedFilePath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const apiBaseUrl = toAbsoluteApiBaseUrl();
  const backendOrigin = apiBaseUrl
    .replace(/\/api\/v\d+\/?$/i, "")
    .replace(/\/$/, "");

  return `${backendOrigin}/${normalizedFilePath}`;
};

API.interceptors.request.use((req) => {
  if (localStorage.getItem("token")) {
    req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }
  return req;
});

export default API;
