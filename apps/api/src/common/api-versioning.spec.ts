import { VersioningType } from '@nestjs/common';
import {
  API_CURRENT_VERSION,
  API_SUPPORTED_VERSIONS,
  API_VERSION_HEADER,
  API_VERSIONING_CONFIG,
} from './api-versioning';

describe('API versioning configuration', () => {
  it('uses a backward-compatible header strategy with v1 as the default', () => {
    expect(API_VERSION_HEADER).toBe('X-API-Version');
    expect(API_CURRENT_VERSION).toBe('1');
    expect(API_SUPPORTED_VERSIONS).toEqual(['1']);
    expect(API_VERSIONING_CONFIG).toEqual({
      type: VersioningType.HEADER,
      header: 'X-API-Version',
      defaultVersion: '1',
    });
  });
});
