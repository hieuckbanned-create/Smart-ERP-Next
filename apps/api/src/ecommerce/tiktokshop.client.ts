import axios from 'axios';
import crypto from 'crypto';

export interface TikTokShopConfig {
  appKey: string;
  appSecret: string;
  shopId: string;
  accessToken?: string;
  apiVersion?: string; // default '2024-10'
}

export class TikTokShopClient {
  private config: TikTokShopConfig;
  private baseUrl: string;

  constructor(config: TikTokShopConfig) {
    this.config = { apiVersion: '2024-10', ...config };
    this.baseUrl = `https://open-api.tiktokglobalshop.com/api/${this.config.apiVersion}`;
  }

  private signRequest(path: string, method: string, body: any = {}): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const sortedParams = { ...body, app_key: this.config.appKey, timestamp, shop_id: this.config.shopId };
    const paramStr = Object.keys(sortedParams).sort().map(k => `${k}${sortedParams[k]}`).join('');
    const signStr = `${method}\n${path}\n${paramStr}\n${this.config.appSecret}`;
    return crypto.createHmac('sha256', this.config.appSecret).update(signStr).digest('hex');
  }

  private async request<T>(method: 'GET' | 'POST', path: string, data?: any): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { ...data, app_key: this.config.appKey, timestamp, shop_id: this.config.shopId };
    const sign = this.signRequest(path, method, params);
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-tiktok-sign': sign,
      'access-token': this.config.accessToken || '',
    };
    const response = await axios({ method, url, data: params, headers });
    if (response.data.code !== 0) throw new Error(`TikTok API error: ${response.data.message}`);
    return response.data.data;
  }

  async getProducts(page = 1, pageSize = 50) {
    return this.request('POST', '/products/search', { page, page_size: pageSize });
  }

  async getOrders(since?: string, page = 1, pageSize = 50) {
    const params: any = { page, page_size: pageSize };
    if (since) params.create_time_from = Math.floor(new Date(since).getTime() / 1000);
    return this.request('POST', '/orders/search', params);
  }

  async getCustomers(page = 1, pageSize = 50) {
    return this.request('GET', `/customers/search?page=${page}&page_size=${pageSize}`, {});
  }

  async registerWebhooks(webhookUrl: string) {
    const events = ['order:create', 'order:ship', 'product:update'];
    for (const event of events) {
      await this.request('POST', '/webhook/register', { event, url: webhookUrl });
    }
  }
}
