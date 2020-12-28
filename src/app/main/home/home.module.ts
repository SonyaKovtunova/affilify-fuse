import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MainComponent } from './main/main.component';
import { SingleComponent } from './single/single.component';

const routes = [
  {
      path     : '',
      component: HomeComponent
  }
];

@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    SingleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    TranslateModule,
    FuseSharedModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
