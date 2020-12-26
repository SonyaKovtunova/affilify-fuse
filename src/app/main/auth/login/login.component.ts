import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _authService: AuthService,
        private _router: Router,
        private _socialAuthService: SocialAuthService
    )
    {
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    ngOnInit() {
        this.loginForm = this._formBuilder.group({
            email   : ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    login() {
        this._authService.login(this.loginForm.getRawValue())
            .subscribe(() => {
                this._router.navigate(['/']);
            });
    }

    googleLogin() {
        this._socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
            .then((response) => {
                const data = {
                    idToken: response.idToken,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                };
    
                this._authService.googleLogin(data).subscribe();
          });
    }

    facebookLogin() {
        this._socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)
            .then((response) => {
                const data = {
                    idToken: response.authToken,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                };
        
                this._authService.facebookLogin(data).subscribe();
            });
    }
}
