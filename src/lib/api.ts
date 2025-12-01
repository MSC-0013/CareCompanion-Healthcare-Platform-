// ✅ Smart API base URL selector
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api" // local backend
    : "https://your-backend.onrender.com/api"); // Render backend

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, {
        ...config,
        mode: "cors", 
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: { name: string; email: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isEmailVerified: boolean;
        };
        token: string;
      };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isEmailVerified: boolean;
          lastLogin: string;
        };
        token: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<{
      success: boolean;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isEmailVerified: boolean;
          lastLogin: string;
          preferences: any;
          profile: any;
        };
      };
    }>("/auth/me");
  }

  async updatePreferences(preferences: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        preferences: any;
      };
    }>("/auth/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  // Profile methods
  async getProfile() {
  return this.request<{
    success: boolean;
    data: {
      personalInfo: any;
      healthInfo: any;
      lifestyle: any;
      bio?: string;
      isComplete: boolean;
      completionPercentage: number;
    };
  }>("/profile");
}


  async updateProfile(profileData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        profile: any;
      };
    }>("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async updatePersonalInfo(personalInfo: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        personalInfo: any;
      };
    }>("/profile/personal", {
      method: "PUT",
      body: JSON.stringify(personalInfo),
    });
  }

  async updateHealthInfo(healthInfo: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        healthInfo: any;
      };
    }>("/profile/health", {
      method: "PUT",
      body: JSON.stringify(healthInfo),
    });
  }

  async updateLifestyle(lifestyle: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        lifestyle: any;
      };
    }>("/profile/lifestyle", {
      method: "PUT",
      body: JSON.stringify(lifestyle),
    });
  }

  async addMedication(medication: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        medications: any[];
      };
    }>("/profile/medications", {
      method: "POST",
      body: JSON.stringify(medication),
    });
  }

  async updateMedication(medicationId: string, medication: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        medications: any[];
      };
    }>(`/profile/medications/${medicationId}`, {
      method: "PUT",
      body: JSON.stringify(medication),
    });
  }

  async deleteMedication(medicationId: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        medications: any[];
      };
    }>(`/profile/medications/${medicationId}`, {
      method: "DELETE",
    });
  }

  async getProfileCompletion() {
    return this.request<{
      success: boolean;
      data: {
        completionPercentage: number;
        isComplete: boolean;
        profile: any;
      };
    }>("/profile/completion");
  }

  // Subscription methods
  async getPlans() {
    return this.request<{
      success: boolean;
      data: {
        plans: Array<{
          id: string;
          name: string;
          price: string;
          period: string;
          description: string;
          features: string[];
          limitations?: string[];
          popular?: boolean;
        }>;
      };
    }>("/subscription/plans");
  }

  async getCurrentSubscription() {
    return this.request<{
      success: boolean;
      data: {
        subscription: {
          plan: string;
          planStartDate: string;
          planEndDate: string;
          status: string;
        };
      };
    }>("/subscription/current");
  }

  async subscribeToPlan(
    planId: string,
    paymentMethod: string,
    paymentId?: string
  ) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        subscription: any;
      };
    }>("/subscription/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId, paymentMethod, paymentId }),
    });
  }

  async cancelSubscription() {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        plan: string;
      };
    }>("/subscription/cancel", {
      method: "POST",
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;
