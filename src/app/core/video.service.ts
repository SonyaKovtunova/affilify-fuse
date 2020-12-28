import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as Tus from 'tus-js-client';
import { UploadEventStatus } from './enums/upload-event-status.enum';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  constructor(private http: HttpClient) { }

  public getTusTicket(fileSize: number): Observable<any> {
    return this.http.get<any>(`video/ticket?fileSize=${fileSize}`);
  }

  public getCourseMainVideo(courseId): Observable<any> {
    return this.http.get(`video/course/?id=${courseId}`);
  }

  public getVideo(videoId): Observable<any> {
    return this.http.get(`video/${videoId}`);
  }

  public getVideoSources(videoId): Observable<any> {
    return this.http.get(`video/${videoId}/sources`);
  }

  public getVideoPoster(videoId): Observable<any> {
    return this.http.get(`video/${videoId}/poster`);
  }

  private basicUpload(formData: FormData): Observable<any> {
    return this.http.post('video/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(map((event: any) => {
      switch (event.type) {

        case HttpEventType.UploadProgress:
          const progress = ((event.loaded / event.total) * 100).toFixed(2);
          return { status: UploadEventStatus.Progress, data: progress };

        case HttpEventType.Response:
          return { status: UploadEventStatus.Success, data: event.body };

        default:
          return { status: UploadEventStatus.Event, data: `Unhandled event: ${event.type}` };
      }
    })
    );
  }

  public upload(file: File, useTus = true): Observable<any> {
    if (!useTus) {
      const formData = new FormData();
      formData.append('file', file);
      return this.basicUpload(formData);
    }

    const size = file.size;
    const uploadEvents = new Subject<any>();

    return this.getTusTicket(size)
      .pipe(
        switchMap(ticket => {

          new Tus.Upload(file, {
            uploadUrl: ticket.uploadLink,
            endpoint: ticket.uploadLink,
            retryDelays: [0, 1000, 3000, 5000],
            onError: error => {
              uploadEvents.error({ status: UploadEventStatus.Error, data: error });
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              const progress = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
              uploadEvents.next({ status: UploadEventStatus.Progress, data: progress });
            },
            onSuccess: () => {
              uploadEvents.next({ status: UploadEventStatus.Success, data: ticket.id });
              uploadEvents.complete();
            }
          }).start();

          return uploadEvents.asObservable();
        })
      );
  }
}
