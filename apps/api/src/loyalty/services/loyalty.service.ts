import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { loyaltyCards, loyaltyRewards, loyaltyTransactions } from '@smart-erp/database/schema';
import { eq, and, sql } from '@smart-erp/database/drizzle';

@Injectable()
export class LoyaltyService {
  async createLoyaltyCard(tenantId: string, customerId: number) {
    const existing = await db
      .select()
      .from(loyaltyCards)
      .where(and(eq(loyaltyCards.tenantId, tenantId), eq(loyaltyCards.customerId, customerId)));

    if (existing.length > 0) {
      throw new Error('Customer already has a loyalty card');
    }

    const [card] = await db
      .insert(loyaltyCards)
      .values({ tenantId, customerId, points: 0, tier: 'bronze' })
      .returning();

    return card;
  }

  async getLoyaltyCard(tenantId: string, customerId: number) {
    const [card] = await db
      .select()
      .from(loyaltyCards)
      .where(and(eq(loyaltyCards.tenantId, tenantId), eq(loyaltyCards.customerId, customerId)));

    if (!card) throw new NotFoundException('Loyalty card not found');
    return card;
  }

  async earnPoints(tenantId: string, customerId: number, points: number, referenceId: string, description: string) {
    const card = await this.getLoyaltyCard(tenantId, customerId);

    const [updated] = await db
      .update(loyaltyCards)
      .set({ points: card.points + points, updatedAt: new Date() })
      .where(and(eq(loyaltyCards.tenantId, tenantId), eq(loyaltyCards.id, card.id)))
      .returning();

    await db.insert(loyaltyTransactions).values({
      loyaltyCardId: card.id,
      points,
      type: 'earn',
      referenceId,
      description,
    });

    return updated;
  }

  async redeemPoints(tenantId: string, customerId: number, points: number, referenceId: string, description: string) {
    const card = await this.getLoyaltyCard(tenantId, customerId);

    if (card.points < points) {
      throw new Error('Insufficient points');
    }

    const [updated] = await db
      .update(loyaltyCards)
      .set({ points: card.points - points, updatedAt: new Date() })
      .where(and(eq(loyaltyCards.tenantId, tenantId), eq(loyaltyCards.id, card.id)))
      .returning();

    await db.insert(loyaltyTransactions).values({
      loyaltyCardId: card.id,
      points: -points,
      type: 'redeem',
      referenceId,
      description,
    });

    return updated;
  }

  async getRewards(tenantId: string) {
    return db
      .select()
      .from(loyaltyRewards)
      .where(and(eq(loyaltyRewards.tenantId, tenantId), eq(loyaltyRewards.isActive, true)));
  }

  async getTransactionHistory(tenantId: string, customerId: number, query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const card = await this.getLoyaltyCard(tenantId, customerId);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.loyaltyCardId, card.id));

    const items = await db
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.loyaltyCardId, card.id))
      .orderBy(loyaltyTransactions.createdAt)
      .limit(limit)
      .offset(offset);

    return { items, total: count, page, limit, totalPages: Math.ceil(count / limit) };
  }
}