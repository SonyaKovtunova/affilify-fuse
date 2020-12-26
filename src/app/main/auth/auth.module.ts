import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';

const routes: Route[] = [
  {
    path     : 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
  },
  {
    path     : 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path     : 'mail-confirm',
    loadChildren: () => import('./mail-confirm/mail-confirm.module').then(m => m.MailConfirmModule)
  },
  {
    path     : 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterModule)
  },
  {
    path     : 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordModule)
  },
  {
      path      : '**',
      redirectTo: 'register'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
