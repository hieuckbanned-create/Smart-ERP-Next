import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from '../customers/customers.entity';
import { Tenant } from '../modules/tenants/tenants.entity';

@Entity('loyalty_cards')
export class LoyaltyCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  @Index()
  customerId: number;

  @Column()
  points: number;

  @Column()
  tier: string;

  @Column()
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}