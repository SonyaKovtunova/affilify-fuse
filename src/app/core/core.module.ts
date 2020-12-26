import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { EndpointInterceptor } from './interceptors/endpoint.interceptor';
import { HttpService } from './interceptors/http.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SpinnerInterceptor } from './interceptors/spinner.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule 
  ],
  providers: [
    AuthInterceptor,
    EndpointInterceptor,
    SpinnerInterceptor,
    {
      provide: HttpClient,
      useClass: HttpService
    }
  ]
})
export class CoreModule { }
