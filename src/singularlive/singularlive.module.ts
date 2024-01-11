import { Module } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { HttpModule } from '@nestjs/axios';
import { SingularliveController } from './singularlive.controller';

@Module({
  imports: [HttpModule],
  providers: [SingularliveService],
  controllers: [SingularliveController],
})
export class SingularliveModule {}
