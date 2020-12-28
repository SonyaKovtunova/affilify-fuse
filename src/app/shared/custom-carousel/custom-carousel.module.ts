import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponent } from './common/common.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExpertComponent } from './expert/expert.component';
import { OriginalsComponent } from './originals/originals.component';
import { TopComponent } from './top/top.component';
import { CustomCarouselComponent } from './custom-carousel.component';



@NgModule({
  declarations: [
    CustomCarouselComponent,
    CommonComponent, 
    DashboardComponent, 
    ExpertComponent, 
    OriginalsComponent, 
    TopComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CustomCarouselModule { }
