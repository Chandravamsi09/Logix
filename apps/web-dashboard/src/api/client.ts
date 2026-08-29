const BASE_URL = 'http://localhost:4000';

export class ApiClient {
  private static token: string | null = null;
  private static tenantId: string = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

  static setToken(token: string) {
    this.token = token;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  }

  // Domain API helpers
  static getAnalyticsDashboard() {
    return this.request<any>('/api/v1/analytics/dashboard');
  }

  static getOrders() {
    return this.request<any[]>('/api/v1/orders');
  }

  static getProducts() {
    return this.request<any[]>('/api/v1/inventory/products');
  }

  static getShipments() {
    return this.request<any[]>('/api/v1/logistics/shipments');
  }

  static getVehicles() {
    return this.request<any[]>('/api/v1/logistics/vehicles');
  }

  static getInvoices() {
    return this.request<any[]>('/api/v1/billing/invoices');
  }

  static getLedger() {
    return this.request<any[]>('/api/v1/billing/ledger');
  }
}
