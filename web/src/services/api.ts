import axios from 'axios';

// Smart API Base: Uses custom VITE_API_BASE_URL if set, or relative path on dev port 3000, or direct 127.0.0.1:8000
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL
  ? (import.meta as any).env.VITE_API_BASE_URL
  : ((typeof window !== 'undefined' && window.location.port === '3000') 
      ? '' 
      : 'http://127.0.0.1:8000');

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pdf_suite_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid or expired credentials so subsequent calls are treated as clean guest calls
      localStorage.removeItem('pdf_suite_token');
      localStorage.removeItem('pdf_suite_user');
    }
    return Promise.reject(error);
  }
);

export interface UserProfile {
  id: number;
  phone_number?: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'USER';
  tokens_balance?: number;
  is_premium: boolean;
  premium_expiry?: string;
  quota?: {
    limit?: number;
    tokens_balance?: number;
    used_today?: number;
    remaining_today?: number;
  };
}

export const authService = {
  async emailLogin(email: string, password: string) {
    const res = await api.post('/api/v1/auth/email-login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('pdf_suite_token', res.data.access_token);
      localStorage.setItem('pdf_suite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async sendOtp(phone_number: string) {
    const res = await api.post('/api/v1/auth/send-otp', { phone_number });
    return res.data;
  },

  async verifyOtp(phone_number: string, otp: string) {
    const res = await api.post('/api/v1/auth/verify-otp', { phone_number, otp });
    if (res.data.access_token) {
      localStorage.setItem('pdf_suite_token', res.data.access_token);
      localStorage.setItem('pdf_suite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async adminLogin(email: string, password: string) {
    const res = await api.post('/api/v1/auth/admin-login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('pdf_suite_token', res.data.access_token);
      localStorage.setItem('pdf_suite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await api.get('/api/v1/auth/me');
      localStorage.setItem('pdf_suite_user', JSON.stringify(res.data));
      return res.data;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('pdf_suite_token');
    localStorage.removeItem('pdf_suite_user');
  },

  getCurrentCachedUser(): UserProfile | null {
    const data = localStorage.getItem('pdf_suite_user');
    return data ? JSON.parse(data) : null;
  }
};

export const convertService = {
  async imageToPdf(files: File[], onProgress?: (pct: number) => void) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await api.post('/api/v1/convert/image-to-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total && onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    });
    return res.data;
  },

  async pdfToImage(file: File, dpi = 150) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dpi', dpi.toString());
    const res = await api.post('/api/v1/convert/pdf-to-image', formData);
    return res.data;
  },

  async compressPdf(file: File, level: 'extreme' | 'recommended' | 'low') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);
    const res = await api.post('/api/v1/convert/compress-pdf', formData);
    return res.data;
  },

  async compressImage(file: File, quality = 70) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality.toString());
    const res = await api.post('/api/v1/convert/compress-image', formData);
    return res.data;
  },

  async fileToZip(files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await api.post('/api/v1/convert/file-to-zip', formData);
    return res.data;
  },

  async pdfToWord(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/v1/convert/pdf-to-word', formData);
    return res.data;
  },

  async wordToPdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/v1/convert/word-to-pdf', formData);
    return res.data;
  },

  async pdfToText(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/v1/convert/pdf-to-text', formData);
    return res.data;
  },

  getDownloadUrl(filename: string) {
    const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
    return `${base}/api/v1/convert/download/${filename}`;
  }
};

export const adminService = {
  async getDashboard() {
    const res = await api.get('/api/v1/admin/dashboard');
    return res.data;
  },

  async listUsers(search = '') {
    const res = await api.get(`/api/v1/admin/users?search=${encodeURIComponent(search)}`);
    return res.data;
  },

  async adjustTokens(userId: number, action: 'set' | 'add', amount: number) {
    const res = await api.post(`/api/v1/admin/users/${userId}/adjust-tokens`, {
      action,
      amount
    });
    return res.data;
  },

  async toggleUserActive(userId: number) {
    const res = await api.post(`/api/v1/admin/users/${userId}/toggle-active`);
    return res.data;
  },

  async deleteUser(userId: number) {
    const res = await api.delete(`/api/v1/admin/users/${userId}`);
    return res.data;
  },

  async updateLimits(starterTokens: number, sizeMb: number) {
    const res = await api.post('/api/v1/admin/config/update-limits', {
      starter_tokens: starterTokens,
      free_max_file_size_mb: sizeMb,
    });
    return res.data;
  },

  async triggerCleanup() {
    const res = await api.post('/api/v1/admin/cleanup');
    return res.data;
  }
};

export const subscriptionService = {
  async getPlans() {
    const res = await api.get('/api/v1/subscription/plans');
    return res.data;
  },

  async createOrder(planType: string, gateway = 'RAZORPAY') {
    const res = await api.post('/api/v1/subscription/create-order', {
      plan_type: planType,
      gateway: gateway
    });
    return res.data;
  },

  async verifyPayment(planType: string, gateway: string, paymentId: string, orderId: string) {
    const res = await api.post('/api/v1/subscription/verify-payment', {
      plan_type: planType,
      gateway: gateway,
      payment_id: paymentId,
      order_id: orderId
    });
    return res.data;
  }
};

export interface TaskItem {
  id: string;
  title: string;
  title_ml: string;
  reward_tokens: number;
  icon: string;
  badge: string;
  description: string;
  description_ml: string;
  action_label: string;
  action_label_ml: string;
  tip_content?: string;
  share_url?: string;
  is_claimed?: boolean;
}

export const tokenService = {
  async getStatus(): Promise<{ tokens_balance: number; is_super_admin: boolean; tasks: TaskItem[] }> {
    const res = await api.get('/api/v1/tokens/status');
    return res.data;
  },

  async claimTask(taskId: string, feedbackText?: string) {
    const res = await api.post('/api/v1/tokens/claim', { task_id: taskId, feedback_text: feedbackText });
    if (res.data.access_token) {
      localStorage.setItem('pdf_suite_token', res.data.access_token);
    }
    if (res.data.user) {
      localStorage.setItem('pdf_suite_user', JSON.stringify(res.data.user));
    } else {
      const cached = localStorage.getItem('pdf_suite_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.tokens_balance = res.data.tokens_balance;
          localStorage.setItem('pdf_suite_user', JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }
      }
    }
    return res.data;
  }
};
