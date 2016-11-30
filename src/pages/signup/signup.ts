import { NavController, LoadingController, AlertController, Events } from 'ionic-angular';
import { NativeStorage } from 'ionic-native';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DjangoAuth } from '../../providers/djangoAuth';
import { HomePage } from '../home/home';
//import {Cookie} from 'ng2-cookies/ng2-cookies';

@Component({
  templateUrl: 'signup.html'
})
export class SignupPage {

  submitted:boolean = false;
  loading:any;
  signup:any = {};
  tandc:boolean = false;

  constructor(public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public nav: NavController,
              public events : Events,
              public djangoAuth: DjangoAuth,
              public formBuilder: FormBuilder) {
    this.nav = nav;
  }

  onSignup(form){
    event.preventDefault();

    if (!this.tandc) {
      this.showAlert('Terms and Conditions','You must accept the Terms and Conditions.');
      return;
    }

    this.submitted = true;

    console.log(form);

    var usernameLength = form.controls.username.value.length;
    var passwordLength = form.controls.password.value.length;
    var errorString = '';
    if (usernameLength < 6 || usernameLength > 15) errorString = 'Username must be between 6 and 15 characters long';
    else if (/[^a-zA-Z0-9]/.test((form.controls.username.value))) errorString = 'You can only use letters and numbers in your username';
    if (passwordLength < 8 || passwordLength > 15) {
      if (errorString != '') errorString += ' ';
      errorString = 'Password must be between 8 and 15 characters long.';
    }
    if (errorString != '') {
      this.showAlert('Incorrect Data', errorString);
      return;
    }

    if (form.valid) {
      let loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      loading.present(loading);
      this.djangoAuth.register(form.controls.username.value, form.controls.password.value, form.controls.password.value, form.controls.email.value)
        .then((data:any)=>{
            //this.events.publish('user:signup');
            console.log('========== SUCCESSFULL SIGNUP, about to do login');

            // Store user's username to show they are logged in (this gets cleared if login fails)
            NativeStorage.setItem('user', {username: form.controls.username.value, password: form.controls.password.value})
              .then(
                () => console.log('****** login.ts:onLogin: Stored username and password'),
                error => console.error('Error storing item', error)
              );

            // Register worked so do automatic login
            this.djangoAuth.login(form.controls.username.value, form.controls.password.value)
              .then((data:any)=>{
                  //alert('login success');
                  console.log('============ SUCCESSFULL LOGIN');
                  loading.dismiss();
                  this.events.publish('user:login');
                  // success case
                  this.nav.setRoot(HomePage);
                },
                (err:any) =>{
                  this.events.publish('user:logged_out');
                  loading.dismiss();
                  console.log('============ UNSUCCESSFULL LOGIN');
                  NativeStorage.setItem('user', {username: "", password: ""})
                    .then(
                      () => console.log('login.ts:onLogin: Login failed so have cleared username and password'),
                      error => console.error('Error with NativeStorage.setItem', error)
                    );

                  this.djangoAuth.removeAuthToken();
                  this.djangoAuth.removeUsername();
                  this.showAlert("Problem Logging In","Unexpected problem logging you in with your new account!");//+JSON.stringify(err));
                });
            /*
            loading.dismiss();
            this.events.publish('user:signup');
            // success case
            this.nav.setRoot(HomePage);
            */
          },
          (err:any) =>{
            loading.dismiss();
            this.djangoAuth.removeAuthToken();
            let signupError = JSON.parse(err.error._body);
            let emailError = '';
            if (signupError.email[0]) emailError = signupError.email[0];
            let usernameError = '';
            if (signupError.username[0]) usernameError = signupError.username[0];
            let errorString = '';
            if (emailError != '') errorString = errorString + emailError;
            if (usernameError != '')
              if (errorString != '') errorString = errorString + '. ' + usernameError;
              else errorString = errorString + usernameError;
            //alert('xx='+xx);
            //alert('Stringified xx = '+JSON.stringify(xx));
            //console.log('%%%%%% DATA: ' + JSON.stringify(err.error));
            this.showAlert("Problem with Signup","There was a problem creating a new account for you. " + errorString);//+JSON.stringify(err));
          });
    }
  }

  alphanumeric(inputtxt) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if(inputtxt.value.match(letterNumber)) return true;
    else return false;
  }

  listenToLoginEvents() {
    /*
    this.events.subscribe('user:signup', () => {
      //alert("signup.js:[user:signup");
      this.loading.dismiss();
      this.nav.setRoot(ProfilePage);
    });

    this.events.subscribe('user:login', () => {
      //alert("signup.js:[user:login");
      this.loading.dismiss();
    });

    this.events.subscribe('user:loginFailed', (error) => {
      //alert("login.js:[user:login");
      this.loading.dismiss();
      this.showAlert("Login Error", error);
    });

    this.events.subscribe('user:signupFailed', (error) => {
      //alert("signup.js:[user:signupFailed");
      this.loading.dismiss();
      this.showAlert("Signup Error", error);
    });
    */
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
