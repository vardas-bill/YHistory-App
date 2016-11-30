import { NavController, LoadingController, AlertController, Events } from 'ionic-angular';
import { Component } from '@angular/core';
import { NativeStorage } from 'ionic-native';
import { DjangoAuth } from '../../providers/djangoAuth';
import { SignupPage } from '../signup/signup';
import { HomePage } from '../home/home';
import { ResetPasswordPage } from '../reset-password/reset-password';

@Component({
  templateUrl: 'login.html'
})

export class LoginPage {

  login:any = {};
  submitted:boolean = false;
  loading:any;
  tandc:boolean = false;
  public loginForm: any;

  constructor(public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              public nav : NavController,
              public djangoAuth: DjangoAuth,
              public events : Events) {
    this.listenToLoginEvents();
  }

  onLogin(form) {
    if (!this.tandc) {
      this.showAlert('Terms and Conditions','You must accept the Terms and Conditions.');
      return;
    }
    //alert('onLogin called: form.controls.username.value='+form.controls.username.value);
    this.submitted = true;
    //form.controls.email.value
    event.preventDefault();
    this.djangoAuth.setUsername(form.controls.username.value);
    //alert('done cookie');
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    loading.present(loading);

    //alert('done loading');

    NativeStorage.setItem('user', {username: form.controls.username.value, password: form.controls.password.value})
      .then(
        () => console.log('****** login.ts:onLogin: Stored username and password'),
        error => console.error('Error storing item', error)
      );

    this.djangoAuth.login(form.controls.username.value, form.controls.password.value)
      .then((data:any)=>{
          //alert('login success');
          loading.dismiss();
          this.events.publish('user:login');
          // success case
          this.nav.setRoot(HomePage);
        },
        (err:any) =>{
          this.events.publish('user:logged_out');
          loading.dismiss();
          NativeStorage.setItem('user', {username: "", password: ""})
            .then(
              () => console.log('login.ts:onLogin: Login failed so have cleared username and password'),
              error => console.error('Error storing item', error)
            );

          this.djangoAuth.removeAuthToken();
          this.djangoAuth.removeUsername();
          this.showAlert("Problem Logging In","Could not find a user with that username and password.");//+JSON.stringify(err));
        });
  }

  onSignup() {
    this.nav.setRoot(SignupPage);
  }

  onForgotPassword(form) {
    this.nav.setRoot(ResetPasswordPage);
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  listenToLoginEvents() {
    this.events.subscribe('user:loginFailed', (error) => {
      this.loading.dismiss();
      this.showAlert("Login Error", error);
    });

    this.events.subscribe('user:resetPassword', (result) => {
      this.loading.dismiss();
      this.showAlert("Forgotten Password", result);
    });

    this.events.subscribe('user:resetPasswordFailed', (error) => {
      this.loading.dismiss();
      this.showAlert("Forgotten Password", error);
    });
  }

  showTandC(){
    this.showAlert('Terms and Conditions', "1. You agree to give the World Image Archive the right, in perpetuity, to display the images you submit to the World Image Archive on the World Image Archive websites, in the World Image Archive apps, in World Image Archive publicity and promotion materials, and via the World Image Archive API." +
      "<br />2. You will not submit any images that contain illegal content or violate copyright.");
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['Ok']
    });
    alert.present(alert);
  }
}
