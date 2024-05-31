import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, isAxiosError } from 'axios';
import { catchError, retry, timer } from 'rxjs';

@Injectable()
export class LiftingcastEndpoint {
  private couchdbBaseUrl = 'https://couchdb.backup.liftingcast.com';
  private apiBaseUrl = 'https://backup.liftingcast.com/apiv2';
  private apiKey: string;
  private readonly logger = new Logger(LiftingcastEndpoint.name);

  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {
    this.apiKey = this.configService.getOrThrow("LC_API_KEY")
  }

  getPlatformDocument(
    platformId: string,
    meetId: string,
    password: string,
    seqNumber: string,
    abortController: AbortController,
  ) {
    const docIds = encodeURI(
      `["${platformId}","rleft-${platformId}","rhead-${platformId}","rright-${platformId}"]`,
    );
    const url = `${this.couchdbBaseUrl}/${meetId}/_changes?feed=longpoll&include_docs=true&filter=_doc_ids&doc_ids=${docIds}&since=${seqNumber}`;
    return this.httpService
      .get(url, {
        signal: abortController.signal,
        timeout: 55000,
        headers: { Authorization: 'Basic ' + btoa(`${meetId}:${password}`) },
      })
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error('getPlatformDocument');
          this.logger.error(error);
          throw error;
        }),
      );
  }

  getMeet(meetId: string, password: string) {
    const url = `${this.apiBaseUrl}/meets/${meetId}`;
    this.logger.log(this.apiKey, meetId, password, url)
    return this.httpService
      .get(url, {
        headers: {
          "x-api-key": this.apiKey,
          Authorization: 'Basic ' + btoa(`${meetId}:${password}`)
        },
      })
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            if (
              isAxiosError(error) &&
              error.response.status === HttpStatus.TOO_MANY_REQUESTS
            ) {
              this.logger.warn('Too Many Requests');

              const backoffTimeMs =
                error.response.data?.additionalInfo?.msBeforeNext;
              const backoff = backoffTimeMs ?? retryCount * 5000;

              this.logger.warn('backoffTimeMs', backoff);
              return timer(backoff);
            }
          },
        }),
        catchError((error) => {
          this.logger.error('getMeet');
          this.logger.error(meetId);
          this.logger.error(error);
          this.logger.error(new Error().stack);
          throw error;
        }),
      );
  }
}
