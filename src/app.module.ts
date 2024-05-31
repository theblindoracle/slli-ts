import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LiftingcastModule } from './liftingcast/liftingcast.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SlliModule } from './slli/slli.module';
import { SingularliveModule } from './singularlive/singularlive.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsModule } from './records/records.module';
import { Record } from './records/records.entity';
import { UsaplModule } from './usapl/usapl.module';
import { RankingsModule } from './rankings/rankings.module';
import { Ranking } from './rankings/rankings.entity';
import { Session } from './session/session.entity';
import { SessionModule } from './session/session.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/db',
      synchronize: true,
      entities: [Record, Ranking, Session],
    }),
    EventEmitterModule.forRoot(),
    LiftingcastModule,
    SlliModule,
    SingularliveModule,
    RecordsModule,
    UsaplModule,
    RankingsModule,
    SessionModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
