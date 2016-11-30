import {NavController, LoadingController} from 'ionic-angular';
import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {DjangoAuth} from '../../providers/djangoAuth';

@Component({
  templateUrl: 'reset-password.html'
})
export class ResetPasswordPage {
  public resetPasswordForm: any;


  constructor(public loadingCtrl: LoadingController, public djangoAuth: DjangoAuth, public formBuilder: FormBuilder, public nav: NavController) {
    this.djangoAuth = djangoAuth;

    this.resetPasswordForm = formBuilder.group({
      email: ['', Validators.required],
    })
  }

  resetPassword(event){
    event.preventDefault();
    this.djangoAuth.resetPassword(this.resetPasswordForm.value.email);
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    loading.present(loading);
  }
}
