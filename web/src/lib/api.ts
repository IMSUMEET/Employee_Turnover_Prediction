import type {
  BatchResult,
  EmployeeInput,
  ModelInfo,
  Prediction,
} from "./types";

// Requests go through Next's rewrite (/api/* -> FastAPI) to avoid CORS in dev.
const BASE = "/api";

export const TOKEN_KEY = "attritioniq_token";
export const USER_KEY = "attritioniq_user";

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
}

export const api = {
  async register(username: string, password: string) {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handle<AuthResponse>(res);
  },

  async login(username: string, password: string) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handle<AuthResponse>(res);
  },

  async predict(employee: EmployeeInput) {
    const res = await fetch(`${BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(employee),
    });
    return handle<Prediction>(res);
  },

  async predictBatch(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/predict/batch`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    return handle<BatchResult>(res);
  },

  async modelInfo() {
    const res = await fetch(`${BASE}/model/info`, { headers: { ...authHeaders() } });
    return handle<ModelInfo>(res);
  },
};
