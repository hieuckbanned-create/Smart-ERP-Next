import { Injectable } from '@nestjs/common';
import { db } from '@smart-erp/database';

export type DrizzleDB = typeof db;

@Injectable()
export class DrizzleService {
  readonly db: DrizzleDB = db;
}
