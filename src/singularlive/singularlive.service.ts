import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { UpdateControlAppContentDTO } from './singularlive.dtos';
import { AxiosError } from 'axios';

@Injectable()
export class SingularliveService {
  logger = new Logger(SingularliveService.name);
  constructor(private readonly httpService: HttpService) {}

  private baseUrl = `https://app.singular.live/apiv2/controlapps`;

  async updateControlAppContent(
    controlAppToken: string,
    compositions: UpdateControlAppContentDTO | UpdateControlAppContentDTO[],
  ) {
    const body = compositions instanceof Array ? compositions : [compositions];

    const url = `${this.baseUrl}/${controlAppToken}/control`;
    if (body.length === 0) {
      this.logger.warn('body is empty');
      this.logger.warn(new Error().stack);
      return;
    }

    return firstValueFrom(
      this.httpService.patch<IsSuccessResponse>(url, body).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(url);
          this.logger.error(body);
          this.logger.error(error.code);
          this.logger.error(error.message);

          throw error;
        }),
      ),
    );
  }
}

interface IsSuccessResponse {
  success: boolean;
}
