export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    }
  }

  initToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });
    const json = (await res.json()) as ApiEnvelope<T>;
    if (!res.ok) {
      throw new Error(
        (json as { message?: string }).message || 'Error del servidor',
      );
    }
    return json.data;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async uploadImage(file: File): Promise<string> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload/imagen`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = (await res.json()) as ApiEnvelope<{ url: string }>;
    if (!res.ok) {
      throw new Error(
        (json as { message?: string }).message || 'Error al subir la imagen',
      );
    }
    return json.data.url;
  }
}

export const api = new ApiClient();
