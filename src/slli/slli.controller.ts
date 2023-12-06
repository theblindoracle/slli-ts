import { Controller, Post } from '@nestjs/common';

@Controller('slli')
export class SlliController {
  @Post('pre-meet')
  preMeet() {
    return 'premeet';
  }
}
