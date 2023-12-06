import { Inject, Injectable } from '@nestjs/common';
import { AnimationState } from './singularlive.enteties';
import { SingularAppControlService } from './singularlive.service';

@Injectable()
class SingularLiveStageManger {
  private readonly controlAppService: SingularAppControlService;
  constructor(controlAppId: string) { }

  playMainComp() {
    //stage prep
    const nameWidget = new SingularLiveWidget<{ firstName: string }>('nameId');
    const timeWidget = new SingularLiveWidget<{ time: number }>('timeId');

    timeWidget.updateWidget();
  }
}

class SingularLiveWidget<TPayload> {
  @Inject(SingularAppControlService)
  private readonly controlAppService: SingularAppControlService;
  constructor(private subcompositionId: string) { }

  updateWidget(payload?: TPayload, animationState?: AnimationState) { }
}
