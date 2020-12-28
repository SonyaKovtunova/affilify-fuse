import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  CourseDetailedEvent: EventEmitter<number> = new EventEmitter<number>();
  VideoPlayedEvent: EventEmitter<string> = new EventEmitter<string>();
  representativeInvitedEvent: EventEmitter<void> = new EventEmitter<void>();

  filterModel$ = new BehaviorSubject({
    category: [],
    level: [],
    rating: 0,
    isFree: false,
    isCost: false,
    keywords: ''
  });

  isMuted$ = new BehaviorSubject(true);
  
  constructor(private http: HttpClient) {
  }

  uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
