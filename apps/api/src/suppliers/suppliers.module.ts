import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierCollaborationService } from './supplier-collaboration.service';
import { SupplierCollaborationController } from './supplier-collaboration.controller';

@Module({
  controllers: [SuppliersController, SupplierCollaborationController],
  providers: [SuppliersService, SupplierCollaborationService],
  exports: [SuppliersService, SupplierCollaborationService],
})
export class SuppliersModule {}
