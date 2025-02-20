// src/config.ts
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://semantle-backend.qwertea.dev"
    : "http://localhost:3000");
