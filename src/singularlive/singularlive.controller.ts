import { Controller, Get, Logger, Patch } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { MainScene } from './singularlive.mainscene';
import { RefLights } from 'src/liftingcast/liftingcast.enteties';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';

@Controller('singularlive')
export class SingularliveController {
  logger = new Logger(SingularliveController.name);
  constructor(
    private readonly singularliveService: SingularliveService,
    private readonly liftingcastService: LiftingcastService,
  ) { }

  @Patch('update-lights')
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

  @Patch('update-platform')
  async updatePlatform() {
    const meetDocument =
      await this.liftingcastService.getMeetData('mqky3v477ua5');

    const mainScene = new MainScene(
      this.singularliveService,
      '6cH7JoT66pUWex7mDTM1z7',
    );

    const currentLifterID = meetDocument.platforms[0].currentAttempt.lifter.id;

    const currentLifter = meetDocument.lifters.find(
      (lifter) => (lifter.id = currentLifterID),
    );

    const division = meetDocument.divisions.find(
      (division) => division.id === currentLifter.divisions[0].divisionId,
    );

    const weightClass = division.weightClasses.find(
      (weightClass) =>
        weightClass.id === currentLifter.divisions[0].weightClassId,
    );

    const nextLifters = meetDocument.platforms[0].nextAttempts
      .map((attempt) => attempt.lifter.id)
      .map(
        (lifterId) =>
          meetDocument.lifters.find((lifter) => lifter.id === lifterId).name,
      );

    console.log(nextLifters);
    await mainScene.playAttemptChange(
      currentLifter,
      meetDocument.platforms[0].currentAttempt,
      `${division.name} - ${weightClass.name}`,
      nextLifters,
    );
  }

  @Patch('update-timer')
  async updateTimer() {
    const mainScene = new MainScene(
      this.singularliveService,
      '6cH7JoT66pUWex7mDTM1z7',
    );

    await mainScene.updateTimer(90, 'started');
  }
}
