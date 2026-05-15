import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LoyaltyCard } from './loyalty-card.entity';

@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loyaltyCardId: number;

  @Column()
  points: number;

  @Column()
  type: 'earn' | 'redeem' | 'expire';

  @Column()
  referenceId: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LoyaltyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loyalty_card_id' })
  loyaltyCard: LoyaltyCard;
}