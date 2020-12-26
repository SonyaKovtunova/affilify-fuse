import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import * as moment from 'moment';

export class User {
  email: string;
  id: string;
  roles: string[];
  isAdmin: boolean;
  isExpert: boolean;
  isAffiliate: boolean;
}

export const ANONYMOUS_USER: User = {
  email: null,
  id: null,
  roles: [],
  isAdmin: false,
  isExpert: false,
  isAffiliate: false,
};

export class UserInfo {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  address: string;
  city: string;
  country: string;
  state: string;
  zipCode: string;
}
export const ANONYMOUS_USER_INFO: UserInfo = {
  email: null,
  id: null,
  firstName: null,
  lastName: null,
  phone: null,
  avatar: null,
  address: null,
  city: null,
  country: null,
  state: null,
  zipCode: null,
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  info$: BehaviorSubject<UserInfo> = new BehaviorSubject(ANONYMOUS_USER_INFO);
  currentUser$: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor(private http: HttpClient,
              @Inject(PLATFORM_ID) private platformId: Object,
              private cookieService: CookieService) {
    if (this.isLoggedIn()) {
      this.currentUser$.next(this.getUser());
      this.getUserData().subscribe();
    }
    else {
      this.currentUser$.next(ANONYMOUS_USER);
      this.info$.next(ANONYMOUS_USER_INFO);
    }
  }

  reloginIfRoleChanged() {
    return this.http.get<any>(`check-role-and-relogin`).pipe(
      tap((x => {
        if (x) {
          this.setSession(x);
        }
      })),
      shareReplay());
  }

  isRoleContains(value, role) {
    return (value & role) === (role + 0);
  }

  isAnonymousUser() {
    return this.currentUser$.value === ANONYMOUS_USER;
  }

  login(body: any): Observable<any> {
    body.anonymousUserGuid = this.cookieService.get('u');
    return this.http.post<any>('login', body).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  register(body: any): Observable<any> {
    if (body?.phone?.e164Number) {
      body.phone = body.phone.e164Number;
    }

    body.anonymousUserGuid = this.cookieService.get('u');
    body.affiliateProgramGuid = this.cookieService.get('a');

    return this.http.post<any>('register', body).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  inviteRegistration(body: any): Observable<any> {
    if (body?.phone?.e164Number) {
      body.phone = body.phone.e164Number;
    }

    return this.http.post<any>('invite-registration', body).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  getUserData(): Observable<any> {
    return this.http.get('info').pipe(
      tap((res: UserInfo) => this.info$.next(res)),
      shareReplay()
    );
  }

  getMerchantDefaultAgreementText(): Observable<string> {
    return this.http.get<any>('user/merchant');
  }

  getAffiliateProgramTermsAndConditionsText(): Observable<string> {
    return this.http.get<any>('user/affilate-program');
  }

  becomeAnExpert(): Observable<any> {
    return this.http.post<any>('user/become-an-expert', null).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  becomeAnAffilate(): Observable<any> {
    return this.http.post<any>('user/become-an-affilate', null).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  googleLogin(body: any): Observable<any> {
    body = body[0];
    body.anonymousUserGuid = this.cookieService.get('u');
    body.affiliateProgramGuid = this.cookieService.get('a');

    return this.http.post<any>('googleLogin', body).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  facebookLogin(body: any): Observable<any> {
    body = body[0];
    body.anonymousUserGuid = this.cookieService.get('u');
    body.affiliateProgramGuid = this.cookieService.get('a');

    return this.http.post<any>('facebookLogin', body).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>('resetPassword?email=' + email, null);
  }

  updatePassword(token: string, password: string): Observable<any> {
    return this.http.post<any>('updatePassword?token=' + token + '&password=' + password, null).pipe(
      tap(res => this.setSession(res)),
      shareReplay()
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('intercom_hash');
    localStorage.removeItem('expires_date');
    this.currentUser$.next(ANONYMOUS_USER);
    this.info$.next(ANONYMOUS_USER_INFO);
  }

  setSession(authResult: any) {
    localStorage.setItem('access_token', authResult.token);
    localStorage.setItem('intercom_hash', authResult.intercomHash);
    localStorage.setItem('expires_date', authResult.exp);
    this.currentUser$.next(this.getUser());

    this.getUserData().subscribe();
  }

  getUser(): User {
    if (localStorage.getItem('access_token')) {
      const decodedJWT = jwt_decode(localStorage.getItem('access_token'));
      let roles = decodedJWT['role'];
      if (roles === '0') {
        roles = [];
      }
      if (typeof roles === 'string') {
        roles = [roles];
      }
      return {
        email: decodedJWT['email'],
        id: decodedJWT['nameid'],
        roles,
        isAdmin: roles.some(x => x === 'Admin'),
        isExpert: roles.some(x => x === 'Expert'),
        isAffiliate: roles.some(x => x === 'Affiliate')
      };
    }
    return null;
  }

  isLoggedIn() {
    if (isPlatformBrowser(this.platformId)) {
      return moment().isBefore(this.getExpiration());
    }

    return false;
  }

  getExpiration() {
    const expiresAt = localStorage.getItem('expires_date');
    return moment(expiresAt);
  }
}
