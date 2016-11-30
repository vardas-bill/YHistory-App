import { Component } from '@angular/core';
import { NavController, ToastController, AlertController, LoadingController, Events } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
import { DjangoAuth } from '../../providers/djangoAuth';
import { PhotoPage } from '../photo/photo';
import { AboutPage } from '../about/about';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {
  loading:any;
  constructor(public toastCtrl: ToastController, public alertCtrl: AlertController, public nav: NavController, public djangoAuth: DjangoAuth, public events: Events) {

  }

  logOut(){
    this.djangoAuth.logout();

    let toast = this.toastCtrl.create({
      message: 'You have been logged out',
      duration: 3000
    });

    toast.present(toast);

    //:TO DO: Add next line to an eventlistener
    //this.nav.push(LoginPage);
  }

  addPhoto(){
    // Check user is logged in (if they are there will be an authtoken)
    this.djangoAuth.getAuthToken()
      .then((data:any) => {
          //console.log('******++ HomePage:addPhoto: authtoken success is: '+data);
          if (data) this.nav.setRoot(PhotoPage);
        else {
            let toast = this.toastCtrl.create({message: 'You must be logged in to submit a photo. Please select Login from the menu.',duration: 4000});
            toast.present(toast);
          }
        },
        (err:any)=>{
          console.log('******++ HomePage:addPhoto: authtoken error is: '+err);
          let toast = this.toastCtrl.create({message: 'You must be logged in to submit a photo. Please select Login from the menu.',duration: 4000});
          toast.present(toast);
        });
    return;

    /*
    // Check user is logged in
    this.loading = Loading.create({
      dismissOnPageChange: true,
    });
    this.nav.present(this.loading);

    this.djangoAuth.authenticationStatus()
      .then((data:any) => {
          console.log('****** HomePage:addPhoto: user is logged in');
          this.nav.setRoot(PhotoPage);
          this.hideLoading();
        },
        (err:any)=>{
          this.hideLoading();
          this.showAlert('Must Login','You must be logged in to submit a photo.');
          //this.events.publish('user:logged_out');
          console.log('****** HomePage:addPhoto: User is not logged in');
          // NOTE: Cannot have both loading and toast!
          //let toast = Toast.create({message: 'You must be logged in to submit a photo. Please select Login from the menu.',duration: 4000});
          //this.nav.present(toast);
        });
    */
  }

  about(){
    this.nav.setRoot(AboutPage);
  }

  website(){
    var inAppBrowserRef = new InAppBrowser("http://www.worldimagearchive.com/", "_blank", "location=yes,fullscreen=yes,toolbar=yes,clearcache=yes,clearsessioncache=yes");
    inAppBrowserRef.show();

    //inAppBrowserRef.executeScript(...);
    //inAppBrowserRef.insertCSS(...);
  }

  hideLoading(){
    this.loading.dismiss();
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
