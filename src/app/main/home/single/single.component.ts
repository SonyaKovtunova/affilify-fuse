import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit, OnDestroy {

  @Input() data: any
  @ViewChild(VideoSimpleComponent) videoPlayer: VideoSimpleComponent;
  isVideoPlayed: boolean = false; // is video played or not
  isVideoCanPlay: boolean = false; // is video loaded
  isMuted: boolean;
  firstCurriculum: any;
  videoMutedSub: Subscription
  simpleVideoReadyToPlay: false;
  isVideoLoadedMetadata: false;

  public productTypes = ProductTypes;

  constructor(private eventService: EventService, private router: Router, private courseService: CourseService) { }

  ngOnInit() {
    this.videoMutedSub = this.eventService.isMuted$
      .subscribe(data => {
        this.isMuted = data
      })
  }

  ngOnDestroy() {
    this.videoMutedSub.unsubscribe()
  }

  ngOnChanges () {
  }

  onMoreInfoClick() {
    this.eventService.CourseDetailedEventEmit(this.data.id)
  }

  // video controls
  onSimpleVideoPlay(data) {
    this.isVideoPlayed = data;
  }
  toogleMute() {
    this.eventService.ToggleMuted()
  }
  replay() {
    this.videoPlayer.replay()
  }
  play() {
    this.videoPlayer.play()
  }
  pause() {
    this.videoPlayer.pause()
  }

  navigateToLessonPage(courseId: number, courseTitle: string, courseDescription: string, courseCover: string) {
    this.courseService.getLastPassedLesson(courseId)
      .subscribe(res => {
          this.firstCurriculum = res;
          this.router.navigate(['/course/'+ courseId+ '/lesson/'+ this.firstCurriculum], { state: { data: { title: courseTitle, description: courseDescription, cover: courseCover } } } );
        });
    }
}
