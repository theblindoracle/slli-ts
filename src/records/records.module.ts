import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './records.entity';
import { RecordsController } from './records.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  providers: [RecordsService],
  controllers: [RecordsController],
})
export class RecordsModule {}
