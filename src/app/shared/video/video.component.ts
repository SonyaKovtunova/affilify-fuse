import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { EventService } from 'app/core/event.service';
import { VideoService } from 'app/core/video.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() courseId: number;
  @Input() videoId: number;
  @Input() isAutoplay = false;
  @Input() isMuted = true;
  @Input() videoCanPlay = false;
  @Input() startDelay = 0;
  @Input() currentTime = 0;
  @Input() videoLoadedMetadata = false;
  @Input() setMinorTimeOffset = false;
  @Input() controls = false;
  @Input() isPlay: boolean;
  @Input() isStart: boolean;

  @Output() isVideoLinkDone: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() played: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() muted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() canPlayed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() readyToPlayed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() metadataLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

  videoEventSub: Subscription;
  routerSubscription: Subscription;

  @ViewChild('videoPlayer') videoplayer: ElementRef;
  link: any;
  uuid = '';

  constructor(
    private _router: Router,
    private _videoService: VideoService,
    private _eventService: EventService) {}

  ngOnInit(): void {
    this.videoEventSub = this._eventService.VideoPlayedEvent
      .subscribe((uuid) => {
        if (this.uuid !== uuid) {
          this.pause();
        }
      });

    this.routerSubscription = this._router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.pause();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.videoId) {
      this.loadVideoUrl();
    }

    if (changes.isStart) {
      this.isPlay = this.isStart;
      if (this.isStart) {
        if (this.startDelay) {
          this.playDelay();
        }
        else {
          this.play();
        }
      }
      else {
        this.videoplayer.nativeElement.load();
      }
    }

    if (changes.isPlay) {
      if (this.isPlay) {
        if (this.startDelay) {
          this.playDelay();
        }
        else {
          this.play();
        }
      }
      else {
        this.pause();
      }
    }
  }

  ngOnDestroy(): void {
    this.videoEventSub.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  loadVideoUrl(): void {
    this.link = null;
    this.videoCanPlay = false;
    this.canPlayed.emit(this.videoCanPlay);
    this.readyToPlayed.emit(false);
    if (this.videoId) {
      this._videoService.getVideo(this.videoId)
        .subscribe((resp: any) => {
          if (resp) {
            this.link =  this.setMinorTimeOffset ? `${resp.standardLink}#t=0.001` : resp.standardLink;
          }

          this.isVideoLinkDone.emit(true);
        });
    }
  }

  toogleMute(): void {
    this.isMuted = !this.isMuted;
    this.muted.emit(this.isMuted);
  }

  replay(): void {
    this.isPlay = true;
    this.videoplayer.nativeElement.currentTime = 0;
    this.videoplayer.nativeElement.play();
    this.emitPlayEvent();
  }

  pause(): void {
    this.isPlay = false;
    this.videoplayer?.nativeElement.pause();
  }

  play(): void {
    this.isPlay = true;
    this.videoplayer?.nativeElement.play();
    this.emitPlayEvent();
  }

  onVideoLoadedMetaData(): void {
    this.videoLoadedMetadata = true;
    this.metadataLoaded.emit(this.videoLoadedMetadata);
  }

  playDelay(): void{
    setTimeout(() => {
      if (this.isPlay) {
        this.play();
      }
    }, this.startDelay);
  }

  onVideoPlay(): void {
    this.emitPlayEvent();
    this.played.emit(true);
  }

  emitPlayEvent(): void {
    this.uuid = this._eventService.uuidv4();
    this._eventService.VideoPlayedEvent.emit(this.uuid);
  }

  onVideoPause(): void {
    this.played.emit(false);
  }

  onVideoCanPlay(): void {
    this.videoCanPlay = true;
    this.canPlayed.emit(this.videoCanPlay);
    this.readyToPlayed.emit(true);
  }
}
