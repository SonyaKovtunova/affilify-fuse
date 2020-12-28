import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomSliderModule } from './custom-slider/custom-slider.module';
import { CustomCarouselModule } from './custom-carousel/custom-carousel.module';
import { CustomMobileCarouselComponent } from './custom-mobile-carousel/custom-mobile-carousel.component';
import { CoverModule } from './cover/cover.module';
import { CustomMobileCarouselModule } from './custom-mobile-carousel/custom-mobile-carousel.module';
import { VideoModule } from './video/video.module';

@NgModule({
  declarations: [
    CustomMobileCarouselComponent
  ],
  imports: [
    CommonModule,
    CoverModule,
    CustomCarouselModule,
    CustomMobileCarouselModule,
    CustomSliderModule,
    VideoModule
  ],
  exports: [
    CoverModule,
    CustomCarouselModule,
    CustomMobileCarouselModule,
    CustomSliderModule,
    VideoModule
  ]
})
export class SharedModule { }
