import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map } from 'rxjs';
import { Lifter, MeetDocument } from './liftingcast.enteties';

@Injectable()
export class LiftingcastEndpoint {
  private couchdbBaseUrl = 'https://couchdb.backup.liftingcast.com';
  private apiBaseUrl = 'https://backup.liftingcast.com/apiv2';

  constructor(private readonly httpService: HttpService) { }

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
        timeout: 3000,
        headers: { Authorization: 'Basic ' + btoa(`${meetId}:${password}`) },
      })
      .pipe(
        catchError((error: AxiosError) => {
          console.error(error);
          throw error;
        }),
      );
  }

  getMeet(meetId: string) {
    const url = `${this.apiBaseUrl}/meets/${meetId}`;
    return this.httpService.get(url).pipe(
      catchError((error: AxiosError) => {
        // TODO: handle 429 too many request logic
        console.error(error);
        throw error;
      }),
    );
  }
}
