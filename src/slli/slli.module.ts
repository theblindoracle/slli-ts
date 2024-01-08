import {Module} from '@nestjs/common';
import {SlliService} from './slli.service';
import {SlliController} from './slli.controller';
import {LiftingcastModule} from 'src/liftingcast/liftingcast.module';
import {LiftingcastService} from 'src/liftingcast/liftingcast.service';
import {LiftingcastEndpoint} from 'src/liftingcast/liftingcast.endpoint';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [LiftingcastModule, HttpModule],
  controllers: [SlliController],
  providers: [SlliService, LiftingcastService, LiftingcastEndpoint],
})
export class SlliModule {}
