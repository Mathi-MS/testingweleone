const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthToken = () => {
  return sessionStorage.getItem('accessToken');
};

export const apiClient = {
  post: async (url: string, data: any, customHeaders?: Record<string, string>) => {
    const token = getAuthToken();
    const headers: Record<string, string> = { ...customHeaders };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body;
    if (data instanceof FormData) {
      body = data;
    } else {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },
  put: async (url: string, data: any, customHeaders?: Record<string, string>) => {
    const token = getAuthToken();
    const headers: Record<string, string> = { ...customHeaders };
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    let body;
    if (data instanceof FormData) {
      body = data;
    } else {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
    delete: async (url: string, customHeaders?: Record<string, string>) => {
    const token = getAuthToken();
    const headers: Record<string, string> = { ...customHeaders };

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },
};