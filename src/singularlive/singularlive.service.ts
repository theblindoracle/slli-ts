import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {AnimationState} from './singularlive.enteties';
import {UpdateControlAppContentDTO} from './singularlive.dtos';

@Injectable()
export class SingularliveService {
  constructor() {}
}

export class SingularAppControlService {
  constructor(private readonly httpService: HttpService) {}

  private baseUrl = `https://app.singular.live/apiv2/controlapps`;

  async updateControlAppContent(
    controlAppToken: string,
    subcompositionId: string,
    payload?: any,
    animationState?: AnimationState,
  ) {
    const data: UpdateControlAppContentDTO = {subcompositionId};

    if (payload) {
      data.payload = payload;
    }
    if (animationState) {
      data.state = animationState;
    }

    return firstValueFrom(
      this.httpService.patch<IsSuccessResponse>(
        `${this.baseUrl}/${controlAppToken}/control`,
        {
          data: JSON.stringify(data),
        },
      ),
    );
  }
}

interface IsSuccessResponse {
  success: boolean;
}

class Widget<TPayload> {}

class MainScene {
  constructor(private readonly appControlService: SingularAppControlService) {}

  playAttemptChange() {}
}
