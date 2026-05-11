import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { currencies, NewCurrency } from '@smart-erp/database';
import { eq, and } from 'drizzle-orm';
import { CreateCurrencyDto } from './dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(private drizzle: DrizzleService) {}

  async create(tenantId: string, data: CreateCurrencyDto) {
    const existing = await this.drizzle.db
      .select()
      .from(currencies)
      .where(
        and(
          eq(currencies.tenantId, tenantId),
          eq(currencies.code, data.code)
        )
      )
      .limit(1);

    if (existing.length) {
      throw new ConflictException('Currency code already exists for this tenant');
    }

    const newCurrency: NewCurrency = {
      tenantId,
      code: data.code,
      name: data.name,
      symbol: data.symbol,
      decimalPlaces: data.decimalPlaces?.toString() ?? '2',
      isBaseCurrency: data.isBaseCurrency ?? false,
    };

    const [created] = await this.drizzle.db
      .insert(currencies)
      .values(newCurrency)
      .returning();
    return created;
  }

  async findAll(tenantId: string) {
    return this.drizzle.db
      .select()
      .from(currencies)
      .where(eq(currencies.tenantId, tenantId));
  }

  async findOne(tenantId: string, id: string) {
    const [currency] = await this.drizzle.db
      .select()
      .from(currencies)
      .where(and(eq(currencies.tenantId, tenantId), eq(currencies.id, id)))
      .limit(1);
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async getBaseCurrency(tenantId: string) {
    const [base] = await this.drizzle.db
      .select()
      .from(currencies)
      .where(
        and(
          eq(currencies.tenantId, tenantId),
          eq(currencies.isBaseCurrency, true)
        )
      )
      .limit(1);
    return base;
  }

  async update(tenantId: string, id: string, data: Partial<CreateCurrencyDto>) {
    const existing = await this.findOne(tenantId, id);
    if (!existing) throw new NotFoundException();

    const [updated] = await this.drizzle.db
      .update(currencies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(currencies.tenantId, tenantId), eq(currencies.id, id)))
      .returning();
    return updated;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.findOne(tenantId, id);
    if (existing.isBaseCurrency) {
      throw new ConflictException('Cannot delete the base currency of the tenant');
    }
    await this.drizzle.db
      .delete(currencies)
      .where(and(eq(currencies.tenantId, tenantId), eq(currencies.id, id)));
    return { success: true };
  }
}
