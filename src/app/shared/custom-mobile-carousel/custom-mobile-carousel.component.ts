import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-mobile-carousel',
  templateUrl: './custom-mobile-carousel.component.html',
  styleUrls: ['./custom-mobile-carousel.component.scss']
})
export class CustomMobileCarouselComponent {

  @Input() data: any[]
  @Input() type: string = 'common'
  @Input() gutter: string = '4vw'

  constructor(private eventService: EventService) {}

  onTileClick(courseId) {
    this.eventService.CourseDetailedEventEmit(courseId);
  }
}
