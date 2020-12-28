import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.scss'],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
          animate('0.5s linear', style({
              opacity: 0
          }))
      ])
    ])
  ]
})
export class CommonComponent implements OnInit, OnDestroy {

  scheduleDays = WebinarDaysOfWeek;

  scaleTime = 150;
  isLoading = true;
  firstCurriculum: any;
  @Input() hover = true;
  @Input() showProgress = false;
  @Input() isDetailed = false;
  @Input() detailedCourseId = null;

  @Input() course: any;

  _isActive = false;
  _isScaled = false;
  _isVideoPlaying = false;

  @Input() set isActive(val: boolean) {
    this._isActive = val;
    this._isVideoPlaying = false;

    if (!val && this.video?.getCurrentTime()) {
      this.storeCurrentTime();
    }

    if (!this._isActive) {
      this._isScaled = false;
    }
      
    if (this._isActive) {
      setTimeout(() => {
        if (this._isActive) {
          this._isScaled = true;
        }
      }, this.scaleTime);
    }
  }


  @Output() currentTimeInactive: EventEmitter<any> = new EventEmitter<any>();
  @Output() detailsClick: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild(VideoSimpleComponent) video: VideoSimpleComponent

  isVideoCanPlay = false;
  animationState = 'off';

  hideTileControlsTimer = null;
  controlsAnimationState = 'on';
  controlsAnimationTimeout = 1000;
  isMuted: boolean;
  videoMutedSub: Subscription;
  descriptionToShow = '';
  isDescriptionSmallerText = false;

  constructor(private _router: Router,
              private courseService: CourseService,
              private eventService: EventService,
              private timeService: TimeService) { }

  ngOnInit() {
    this.calculateDescriptionToShow();
    this.videoMutedSub = this.eventService.isMuted$
      .subscribe(data => {
        this.isMuted = data;
      });
  }

  ngOnDestroy() {
    this.videoMutedSub.unsubscribe();
  }

  onMouseMove (event) {
    if (this.isActive) {
      this.resetHideTileControlsTimer();
    }
  }

  get getAnimationState() {
    return this._isActive && this._isScaled ? 'on' : 'off';
  }
  
  get isActive() {
    return this._isActive;
  }

  get isDetailedMode() {
    return !!this.detailedCourseId
  }

  getColorClassByName(name) {
    switch (name) {
      case 'new':
        return 'bg-positive';
        break;
      case 'hot':
        return 'bg-negative';
        break;
      default:
        return 'bg-teal';
    }
  }

  getItemType(type: number) {
    if (type === HomeItemType.Course) {
      return 'Course';
    }
    else if (type === HomeItemType.Service) {
      return 'Service';
    }
    else if (type === HomeItemType.Webinar) {
      return 'On-Demand Virtual Event';
    }
  }

  checkIsWebinar(type: number) {
    return type === HomeItemType.Webinar;
  }

  checkIsCourse(type: number) {
    return type === HomeItemType.Course;
  }

  getProductType(type: number) {
    if (type === HomeItemType.Course) {
      return ProductTypes.Course;
    }
    else if (type === HomeItemType.Service) {
      return ProductTypes.Service;
    }
  }

  resetHideTileControlsTimer() {
    clearTimeout(this.hideTileControlsTimer);
    this.controlsAnimationState = 'on';
    // only if video is playing
    if (this._isVideoPlaying) {
      this.hideTileControlsTimer = setTimeout(() => {
        this.controlsAnimationState = 'off';
      }, this.controlsAnimationTimeout);
    }
  }

  onShowDetailsClick() {
      this.detailsClick.emit(this.course?.id);
  }

  replayVideo() {
    this.video.replay();
  }

  toggleMute() {
    this.eventService.ToggleMuted();
  }

  onVideoPlay(data) {
    this._isVideoPlaying = data;

    if (!this._isVideoPlaying) {
      this.controlsAnimationState = 'on';
    }
  }

  onVideoReadyToPlay(data) {
    this.isVideoCanPlay = data;
    if (data) {
      this.video.play();
    }
  }

  storeCurrentTime() {
    this.currentTimeInactive.emit({ 
      id: this.course.id, 
      currentTime: this.video?.getCurrentTime()
    });
  }

  navigateToLessonPage(courseId: number, courseTitle: string, courseDescription: string, courseCover: string) {
    this.isLoading = true;
    this.courseService.getLastPassedLesson(courseId)
      .subscribe(res => {
          this.firstCurriculum = res;
          this.isLoading = false;
          this._router.navigate(['/course/' + courseId + '/lesson/' + this.firstCurriculum], 
            { state: { data: { title: courseTitle, description: courseDescription, cover: courseCover } } } );
        });
  }

  calculateDescriptionToShow() {
    let description = this.course?.description.trim();
    const dscrLength = description.length;

    if (dscrLength > 112 && dscrLength <= 136) {
      this.isDescriptionSmallerText = true;
    }
    else if (this.course?.description.length > 112) {
      description = this.course?.description.substring(0, 111) + '...';
    }
    this.descriptionToShow = description;
  }

  getTimeStr(schedule: any) {
    return this.timeService.getWebinarTimeString(schedule.hour, schedule.minute);
  }
}
