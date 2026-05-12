import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRule } from './approval-rule.entity';
import { CreateApprovalRuleDto } from './dto/create-approval-rule.dto';

@Injectable()
export class ApprovalRulesService {
  constructor(
    @InjectRepository(ApprovalRule)
    private ruleRepo: Repository<ApprovalRule>,
  ) {}

  async create(tenantId: string, dto: CreateApprovalRuleDto) {
    const rule = this.ruleRepo.create({ ...dto, tenantId });
    return this.ruleRepo.save(rule);
  }

  async findAll(tenantId: string) {
    return this.ruleRepo.find({ where: { tenantId }, order: { priority: 'ASC' } });
  }

  async findOne(tenantId: string, id: string) {
    return this.ruleRepo.findOne({ where: { tenantId, id } });
  }

  async update(tenantId: string, id: string, dto: Partial<CreateApprovalRuleDto>) {
    await this.ruleRepo.update({ tenantId, id }, dto);
    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string) {
    return this.ruleRepo.delete({ tenantId, id });
  }

  async getMatchingRule(tenantId: string, entityType: string, data: any): Promise<ApprovalRule | null> {
    const rules = await this.findAll(tenantId);
    for (const rule of rules) {
      if (rule.entityType !== entityType) continue;
      if (!rule.condition || rule.condition.length === 0) return rule;
      let matches = true;
      for (const cond of rule.condition) {
        const value = data[cond.field];
        switch (cond.operator) {
          case 'eq':
            if (value !== cond.value) matches = false;
            break;
          case 'gt':
            if (value <= cond.value) matches = false;
            break;
          case 'lt':
            if (value >= cond.value) matches = false;
            break;
          case 'contains':
            if (!String(value).includes(String(cond.value))) matches = false;
            break;
        }
        if (!matches) break;
      }
      if (matches) return rule;
    }
    return null;
  }
}