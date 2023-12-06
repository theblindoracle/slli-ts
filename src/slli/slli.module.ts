import { Module } from '@nestjs/common';
import { SlliService } from './slli.service';
import { SlliController } from './slli.controller';

@Module({
  controllers: [SlliController],
  providers: [SlliService],
})
export class SlliModule { }
