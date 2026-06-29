import { VersioningType, type VersioningOptions } from '@nestjs/common';

export const API_VERSION_HEADER = 'X-API-Version';
export const API_CURRENT_VERSION = '1';
export const API_SUPPORTED_VERSIONS = ['1'] as const;

export const API_VERSIONING_CONFIG: VersioningOptions = {
  type: VersioningType.HEADER,
  header: API_VERSION_HEADER,
  defaultVersion: API_CURRENT_VERSION,
};
