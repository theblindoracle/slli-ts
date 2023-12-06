import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LiftingcastModule } from './liftingcast/liftingcast.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SlliModule } from './slli/slli.module';
import { SingularliveModule } from './singularlive/singularlive.module';

@Module({
  imports: [EventEmitterModule.forRoot(), LiftingcastModule, SlliModule, SingularliveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
