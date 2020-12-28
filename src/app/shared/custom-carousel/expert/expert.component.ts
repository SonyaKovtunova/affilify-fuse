import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-expert',
  templateUrl: './expert.component.html',
  styleUrls: ['./expert.component.scss'],
  animations: [
    AnimationTrigger.tileVideo
  ]
})
export class ExpertComponent implements OnInit, OnDestroy {
  scaleTime = 150 // time of tile scaling
  @Input() hover = true
  @Input() showProgress = false
  @Input() btnMakeFeatured = false
  @Input() btnPublish = false
  @Input() isDetailed = false
  @Input() detailedCourseId = null

  @Input() course: any
  // @Input() isActive = false   // is Active (hovered)

  _isActive = false;
  _isScaled = false;
  _isVideoPlaying = false;
  
  @Input() 
  set isActive (val: boolean) {
    this._isActive = val
    this._isVideoPlaying = false

    // tile is inactive - try to store current played time
    if (!val && this.video?.getCurrentTime()) {
      this.storeCurrentTime()
    }

    if (!this._isActive)
      this._isScaled = false
          // this.animationState = 'off'

    if (this._isActive)
      setTimeout(() => {
        if (this._isActive) {
          // this.animationState = 'on'
          this._isScaled = true
        }
      }, this.scaleTime)
  }

  get isActive() {
    return this._isActive
  }

  @Output() currentTimeInactive: EventEmitter<CoursePlayTime> = new EventEmitter<CoursePlayTime>()
  @Output() detailsClick: EventEmitter<number> = new EventEmitter<number>()
  
  get getAnimationState () {
    return this._isActive && this._isScaled ? 'on' : 'off'
  }

  @ViewChild(VideoSimpleComponent) video: VideoSimpleComponent

  isVideoCanPlay = false
  animationState = 'off' // state to animate content when the tile is hovered

  hideTileControlsTimer = null 
  controlsAnimationState = 'on' // state to animate disappear active tile content when mouse not moving
  controlsAnimationTimeout = 1000
  isMuted: boolean;
  videoMutedSub: Subscription

  // detect mouse move event
  @HostListener('document:mousemove', ['$event']) 
  onMouseMove (event) {
    if (this.isActive) {
      this.resetHideTileControlsTimer()
    }
  }

  get isDetailedMode() {
    return !!this.detailedCourseId
  }
  constructor( private eventService: EventService) { }

  ngOnInit() {
    this.videoMutedSub = this.eventService.isMuted$
      .subscribe(data => {
        this.isMuted = data
      })
  }

  ngOnDestroy () {
    this.videoMutedSub.unsubscribe()
  }

  getColorClassByName (name) {
    switch(name) {
      case 'new': 
        return 'bg-positive'
        break;
      case 'hot': 
        return 'bg-negative'
        break;
      default:
        return 'bg-teal'
    }
  }

  resetHideTileControlsTimer () {
    clearTimeout(this.hideTileControlsTimer)
    this.controlsAnimationState = 'on';
    // only if video is playing
    if (this._isVideoPlaying) {
      this.hideTileControlsTimer = setTimeout(()=> {
        this.controlsAnimationState = 'off';
      }, this.controlsAnimationTimeout)
    }
  }

  onShowDetailsClick () {
    this.eventService.CourseDetailedEventEmit(this.course?.id)
  }

  // action for buttons
  replayVideo() {
    this.video.replay()
  }

  toggleMute() {
    this.eventService.ToggleMuted()
  }

  onVideoPlay(data) {
    this._isVideoPlaying = data

    if(!this._isVideoPlaying) {
      this.controlsAnimationState ='on'
    }
  }

  onVideoReadyToPlay(data) {
    this.isVideoCanPlay = data;
    if (data) {
      this.video.play()
    }
  }

  storeCurrentTime() {
    const eventData = new CoursePlayTime
    eventData.id = this.course.id
    eventData.currentTime = this.video?.getCurrentTime()
    this.currentTimeInactive.emit(eventData)
  }
}
