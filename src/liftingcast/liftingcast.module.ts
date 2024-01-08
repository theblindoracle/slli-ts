import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {LiftingcastService} from './liftingcast.service';
import {LiftingcastEndpoint} from './liftingcast.endpoint';
import {LiftingcastController} from './liftingcast.controller';

@Module({
  imports: [HttpModule],
  providers: [LiftingcastEndpoint, LiftingcastService],
  controllers: [LiftingcastController],
})
export class LiftingcastModule {}
