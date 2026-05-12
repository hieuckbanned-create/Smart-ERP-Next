/**
 * CRM Lead types — shared across API, Web, Mobile, Desktop
 */
export type LeadSource =
  | 'website'
  | 'referral'
  | 'trade_show'
  | 'social_media'
  | 'email_campaign'
  | 'other';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  leadScore: number; // 0-100
  industry?: string;
  description?: string;
  assignedToId?: string;
  convertedAt?: string;
  convertedAccountId?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  status?: LeadStatus;
  leadScore?: number;
  industry?: string;
  description?: string;
  assignedToId?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {}

export interface LeadStats {
  total: number;
  byStatus: { status: LeadStatus; count: number }[];
  winRate: number;
}

export interface NextBestAction {
  action: 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up';
  priority: number; // 0-100
  reason: string;
}

// API Response types
export interface LeadsResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}