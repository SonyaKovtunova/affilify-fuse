import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  @Input() data: any
  @ViewChild(VideoSimpleComponent) videoPlayer: VideoSimpleComponent;
  isVideoPlayed: boolean = false; // is video played or not
  isVideoCanPlay: boolean = false; // is video can play
  isMuted: boolean;
  firstCurriculum: any;
  videoMutedSub: Subscription
  @ViewChild('header') private header : ElementRef;
  @ViewChild('additional') private additional : ElementRef;

  headerStyleAnimation: string = ''
  additionalStyleAnimation: string = ''

  public productTypes = ProductTypes;

  constructor(private eventService: EventService,
    private router: Router,
    private courseService: CourseService) {}

  ngOnInit() {

    this.videoMutedSub = this.eventService.isMuted$
      .subscribe(data => {
        this.isMuted = data
      })

      this.homeService.getHero()
      .subscribe(data => {
        this.data = data;
      });
  }

  ngOnDestroy() {
    this.videoMutedSub.unsubscribe()
  }

  onMoreInfoClick() {
    this.eventService.CourseDetailedEventEmit(this.data.id)
  }

  // video controls
  onSimpleVideoPlay(data) {
    this.isVideoPlayed = data;

    this.setAnimation()
  }

  setAnimation() {
    if (this.isVideoPlayed) {
      const additionalHeight = this.additional.nativeElement?.offsetHeight
      this.headerStyleAnimation = `transform: translate3d(0px, ${additionalHeight}px, 0px) scale(0.7, 0.7);`
      this.additionalStyleAnimation = `transform: translate3d(0px, ${additionalHeight}px, 0px);`
    }
    else {
      this.headerStyleAnimation = ''
      this.additionalStyleAnimation = ''
    }
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
