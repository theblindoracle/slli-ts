import { Module } from '@nestjs/common';
import { UsaplService } from './usapl.service';
import { HttpModule } from '@nestjs/axios';
import { UsaplController } from './usapl.controller';

@Module({
  imports: [HttpModule],
  providers: [UsaplService],
  controllers: [UsaplController],
})
export class UsaplModule { }
