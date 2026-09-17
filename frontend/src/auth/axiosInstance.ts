// src/utils/axiosInstance.ts
import axios, {
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";

let activeRequests = 0;

// Dispatch loading events
const dispatchLoading = (isLoading: boolean) => {
  window.dispatchEvent(
    new CustomEvent("apiLoading", { detail: { isLoading } })
  );
};

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://peso-sf2h.onrender.com") + "/api";

// Create axios instance WITH baseURL set up front
const AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// -----------------------------
// REQUEST INTERCEPTOR (Axios v1 safe)
// -----------------------------
AxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { skipLoading?: boolean }) => {
    const skipLoading = config.skipLoading;

    if (!skipLoading) {
      activeRequests++;
      if (activeRequests === 1) {
        dispatchLoading(true);
      }
    }

    config.headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    if (config.data instanceof FormData) {
      config.headers.set("Content-Type", "multipart/form-data");
    } else {
      config.headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error) => {
    const skipLoading = (error.config as any)?.skipLoading;

    if (!skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) {
        dispatchLoading(false);
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------
// RESPONSE INTERCEPTOR
// -----------------------------
AxiosInstance.interceptors.response.use(
  (response) => {
    const skipLoading = (response.config as any)?.skipLoading;

    if (!skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) {
        dispatchLoading(false);
      }
    }

    return response;
  },
  (error) => {
    const skipLoading = (error.config as any)?.skipLoading;

    if (!skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) {
        dispatchLoading(false);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;