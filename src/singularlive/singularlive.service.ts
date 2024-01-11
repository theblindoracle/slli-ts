import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { UpdateControlAppContentDTO } from './singularlive.dtos';

@Injectable()
export class SingularliveService {
  constructor(private readonly httpService: HttpService) {}

  private baseUrl = `https://app.singular.live/apiv2/controlapps`;

  async updateControlAppContent(
    controlAppToken: string,
    compositions: UpdateControlAppContentDTO | UpdateControlAppContentDTO[],
  ) {
    const body = compositions instanceof Array ? compositions : [compositions];
    return firstValueFrom(
      this.httpService.patch<IsSuccessResponse>(
        `${this.baseUrl}/${controlAppToken}/control`,
        JSON.stringify(body),
      ),
    );
  }
}

interface IsSuccessResponse {
  success: boolean;
}
