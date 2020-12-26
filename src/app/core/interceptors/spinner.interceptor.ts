import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  private count = 0;

  constructor(
    private _fuseSplashScreenService: FuseSplashScreenService) {

  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.count === 0) {
      this._fuseSplashScreenService.show();
    }
    this.count++;
    
    return next.handle(request).pipe(
      finalize(() => {
        this.count--;
        if (this.count === 0) {
          this._fuseSplashScreenService.hide();
        }
      }));
  }
}
