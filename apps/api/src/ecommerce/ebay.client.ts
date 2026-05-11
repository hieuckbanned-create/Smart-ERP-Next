import axios from 'axios';

export interface EbayConfig {
  appId: string;
  certId: string;
  devId: string;
  userToken: string;        // OAuth user access token (obtained from eBay Developer Portal)
  siteId?: number;
  apiVersion?: string;
}

export class EbayClient {
  private config: EbayConfig;
  private baseUrl: string;

  constructor(config: EbayConfig) {
    this.config = { siteId: 0, apiVersion: '1.0.0', ...config };
    this.baseUrl = 'https://api.ebay.com/sell';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.userToken}`,
      'Content-Type': 'application/json',
      'X-EBAY-API-SITEID': String(this.config.siteId),
    };
  }

  async getProducts(page = 1, limit = 50) {
    const response = await axios.get(`${this.baseUrl}/inventory/v1/inventory_item`, {
      headers: this.getHeaders(),
      params: { limit, offset: (page - 1) * limit },
    });
    return response.data.inventoryItems || [];
  }

  async getOrders(since?: Date, page = 1, limit = 50) {
    const params: any = { limit, offset: (page - 1) * limit };
    if (since) params.creation_date_range_from = since.toISOString();
    const response = await axios.get(`${this.baseUrl}/fulfillment/v1/order`, {
      headers: this.getHeaders(),
      params,
    });
    return response.data.orders || [];
  }

  async getCustomers() {
    // eBay does not expose a dedicated customer list API; derive from orders
    return [];
  }
}
