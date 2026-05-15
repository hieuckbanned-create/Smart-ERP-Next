import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../modules/tenants/tenants.entity';

@Entity('loyalty_rewards')
export class LoyaltyReward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column()
  pointsRequired: number;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}