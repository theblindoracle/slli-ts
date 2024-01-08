import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {LiftingcastModule} from './liftingcast/liftingcast.module';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {SlliModule} from './slli/slli.module';
import {SingularliveModule} from './singularlive/singularlive.module';
import {LoggerMiddleware} from './liftingcast/common/middleware/logger.middleware';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    LiftingcastModule,
    SlliModule,
    SingularliveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
