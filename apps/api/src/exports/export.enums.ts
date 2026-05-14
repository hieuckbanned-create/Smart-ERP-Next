export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
  ZIP = 'zip', // Full backup
}

export enum ExportStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ExportRequest {
  format: ExportFormat;
  entities: string[];
  dateFrom?: string;
  dateTo?: string;
  compressed?: boolean;
}