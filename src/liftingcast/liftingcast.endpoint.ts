import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AxiosError, isAxiosError } from 'axios';
import { catchError, retry, throwError, timer } from 'rxjs';

@Injectable()
export class LiftingcastEndpoint {
  private couchdbBaseUrl = 'https://couchdb.backup.liftingcast.com';
  private apiBaseUrl = 'https://backup.liftingcast.com/apiv2';

  private readonly logger = new Logger(LiftingcastEndpoint.name);

  constructor(private readonly httpService: HttpService) {
    this.httpService.axiosRef.interceptors.request.use((config) => {
      // this.logger.log(`REQUEST: ${config.url} ${config.params} ${config.data}`);
      return config;
    });

    this.httpService.axiosRef.interceptors.response.use((config) => {
      // this.logger.log(
      //   `RESPONSE: ${config.config.url} ${config.status} ${config.statusText} ${config.data}`,
      // );
      return config;
    });
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
          this.logger.error(error);
          throw error;
        }),
      );
  }

  getMeet(meetId: string) {
    const url = `${this.apiBaseUrl}/meets/${meetId}`;
    return this.httpService.get(url).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          if (
            isAxiosError(error) &&
            error.status === HttpStatus.TOO_MANY_REQUESTS
          ) {
            const backoffTimeMs =
              error.response.data?.additionalInfo?.msBeforeNext;
            return timer(backoffTimeMs ?? retryCount * 5000);
          }
        },
      }),
      catchError((error: AxiosError) => {
        // TODO: handle 429 too many request logic
        this.logger.error(error);
        throw error;
      }),
    );
  }
}
