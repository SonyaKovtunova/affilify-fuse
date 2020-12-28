import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-slider',
  templateUrl: './custom-slider.component.html',
  styleUrls: ['./custom-slider.component.scss']
})
export class CustomSliderComponent implements OnInit {
  @Input() isMobileSimple = false;
  @Input() isFullScreen = true;
  @Input() type = 'general';
  @Input() title = ''; // title of the section
  @Input() data: any[]; // array of courses or webinars in the section
  @Input() showProgress: boolean;
  @Input() fixedTileCount: number;
  @Output() detailsClick: EventEmitter<number> = new EventEmitter<number>();

  hoverIndex: number;
  detailedCourseId: number = null;

  currentTile = 6
  currentSlide = 0
  scaleValue = 1.95
  detailedShown = true
  isMobile: boolean
  isCourse: boolean;

  constructor(private ref: ElementRef,
    private platform: Platform) { 

    this.platform.ready().then(() => {
      this.isMobile = this.platform.is('mobileweb')
    })
  }

  ngOnInit() {

    if (this.type === 'originals') {
      this.scaleValue = 1.18;
    }

  }

  onTileDetailsClick (courseId) {
    this.detailsClick.emit(courseId)
    this.detailedShown = false
    if (!this.detailedCourseId) {
      this.detailedCourseId = courseId
      setTimeout(() => {
        this.ref.nativeElement.scrollIntoView({ behavior: "smooth" });
        this.detailedShown = true;
    }, 0)
    }
  }
  
  checkIsCourse(id: number) {
    if(id)
      return this.data.filter(x => x.id == id)[0].type === HomeItemType.Course || this.data.filter(x => x.id == id)[0].type === undefined;
    else
      return true;
  }

  checkIsService(id: number) {
    if(id) {
      return this.data.filter(x => x.id == id)[0].type === HomeItemType.Service;
    }
  }

  onDetailsClose () {
    this.detailedShown = false
    setTimeout(() => {
      this.clearDetailed()
      this.detailedShown = true;
    }, 500)
  }
  
  clearDetailed () {
    this.detailedCourseId = null
  }
}
