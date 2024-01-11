import { Controller, Get, Logger, Patch } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { MainScene } from './singularlive.mainscene';
import { RefLights } from 'src/liftingcast/liftingcast.enteties';

@Controller('singularlive')
export class SingularliveController {
  logger = new Logger(SingularliveController.name);
  constructor(private readonly singularliveService: SingularliveService) { }

  @Patch('updateLights')
  async updateLights() {
    const mainScene = new MainScene(
      this.singularliveService,
      '6cH7JoT66pUWex7mDTM1z7',
    );
    const refLights: RefLights = {
      left: { decision: 'good' },
      head: { decision: 'bad' },
      right: {
        decision: 'bad',
        cards: {
          red: true,
          blue: true,
          yellow: false,
        },
      },
    };
    mainScene.updateLights(refLights);
  }
}
