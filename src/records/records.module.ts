import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './records.entity';
import { RecordsController } from './records.controller';
import { RecordsModel } from './records.model';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  providers: [RecordsService, RecordsModel],
  controllers: [RecordsController],
  exports: [RecordsModel],
})
export class RecordsModule {}
