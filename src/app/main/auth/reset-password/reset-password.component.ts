import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
    selector     : 'reset-password',
    templateUrl  : './reset-password.component.html',
    styleUrls    : ['./reset-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ResetPasswordComponent implements OnInit, OnDestroy
{
    resetPasswordForm: FormGroup;

    token: string;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _authService: AuthService
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

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void
    {
        this.resetPasswordForm = this._formBuilder.group({
            email          : ['', [Validators.required, Validators.email]],
            password       : ['', [Validators.required, passwordValidator]],
            passwordConfirm: ['', Validators.required]
        }, {
            validators: confirmPasswordValidator
        });

        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
            });

        this._activatedRoute.queryParams
            .subscribe(params => {
                if (!params.token) {
                    this._router.navigate(['/']);
                }

                this.token = params.token;
            });
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    resetPassword() {
        this._authService.updatePassword(this.token, this.resetPasswordForm.getRawValue().password)
            .subscribe(() => {
                this._router.navigateByUrl('/');
            });
    }
}

export const passwordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value.match(/[a-z]+/)) {
        return { lowerCaseDontExist: true };
    }
    if (!control.value.match(/[A-Z]+/)) {
        return { upperCaseDontExist: true };
    }
    if (!control.value.match(/[0-9]+/)) {
        return { digitDontExist: true };
    }
    if (control.value.match(/[$@#&!]+/)) {
        return { symbolExist: true };
    }

    return null;
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return {passwordsNotMatching: true};
};
