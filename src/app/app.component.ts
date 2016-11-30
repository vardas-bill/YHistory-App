
import { Component, ViewChild } from '@angular/core';
import { App, Platform, Events, MenuController, Nav } from 'ionic-angular';
import { StatusBar, NativeStorage } from 'ionic-native';
import { HomePage } from '../pages/home/home';
import { GalleryPage } from '../pages/gallery/gallery';
import { SubmittedPage } from '../pages/submitted/submitted';
import { PhotoPage } from '../pages/photo/photo';
import { AboutPage } from '../pages/about/about';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { DjangoAuth } from '../providers/djangoAuth';
//import {ImageData} from '../providers/imageData';
import { AUTH_ENDPOINT } from '../app_settings';

@Component({
  templateUrl: 'app.template.html',
})

export class MyApp {
  rootPage: any = HomePage;
  loggedIn:boolean = false;
  userIsModerator:boolean = false;
  appPages:any = [];
  loggedInPages:any = [];
  loggedOutPages:any = [];
  moderatorPages = [];

  @ViewChild(Nav) nav: Nav;

  root: any;// = HomePage;


  constructor(public app: App,
              public platform: Platform,
              public events : Events,
              public djangoAuth: DjangoAuth,
              public menu : MenuController) {

    if (this.platform.is('ipad')) {
      //alert("I'm an iPad device!");
    }
    else if (this.platform.is('ios')) {
      //alert("I'm an ios device! Width="+this.platform.width()+', Height='+this.platform.height());
    }

    platform.ready().then(() => {

      StatusBar.styleDefault();

      this.djangoAuth.initialize(AUTH_ENDPOINT, false);

      // Check if user is logged in
      console.log('****** app.ts: About to do this.djangoAuth.authenticationStatus');
      this.djangoAuth.authenticationStatus()
        .then((data:any) => {
            console.log('****** app.ts: inside authenticationStatus().then for djangoAuth.authenticationStatus() call - you are logged in');
            console.log('****** app.ts: authenticationStatus() returned: '+JSON.stringify(data));
            //alert('You are logged in');
            // Select the photo upload tab
            //this.tab.select(2);
            this.loggedIn = true;
            this.enableMenu(true);
            this.root = HomePage;
          },
          (err:any)=>{
            // Clear the stored username and password
            NativeStorage.setItem('user', {username: "", password: ""})
              .then(
                () => console.log('djangoAuth.ts:logout: NativeStorage: cleared username and password'),
                error => console.error('Error storing item', error)
              );
            console.log('****** app.ts: inside authenticationStatus().err for djangoAuth.authenticationStatus() call - you are NOT logged in');
            console.log('****** app.ts: authenticationStatus() returned: '+JSON.stringify(err));
            //alert('You are not logged in');
            // Select the login tab
            //let nav = this.app.getActiveNav();
            //this.tabRef.select(1);
            //this.nav.push(LoginPage);
            this.loggedIn = false;
            this.enableMenu(false);
            this.root = HomePage;
          });
    });

    // MENU...
    // create a list of pages that can be navigated to from the left menu
    // the left menu only works after login
    // the login page disables the left menu
    this.appPages = [
      { title: 'About', component: AboutPage, index: 3, icon: 'information-circle' }
    ];

    this.loggedInPages = [
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Submit Photo', component: PhotoPage, icon: 'ios-camera' },
      { title: 'Recent WIA Photos', component: GalleryPage, icon: 'ios-images' },
      { title: 'Your WIA Photos', component: SubmittedPage, icon: 'ios-images' },
      { title: 'About', component: AboutPage, index: 3, icon: 'information-circle' },
      { title: 'Logout', component: HomePage, icon: 'log-out' }
    ];

    this.loggedOutPages = [
      { title: 'About', component: AboutPage, index: 3, icon: 'information-circle' },
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Recent WIA Photos', component: GalleryPage, icon: 'ios-images' },
      { title: 'Login', component: LoginPage, icon: 'log-in' },
      { title: 'Signup', component: SignupPage, icon: 'person-add' }
    ];

    this.moderatorPages = [
      { title: 'Approve new', component: HomePage, icon: 'alert' },
      { title: 'Check reported', component: HomePage, icon: 'alert' }
    ];

    this.listenToLoginEvents();
  }

  // Called by menu items to open the appropriate page
  openPage(page) {
    this.menu.swipeEnable(true);

    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});
    } else {
      this.nav.setRoot(page.component);
    }

    // If the logout menu option has been selected the title will be Logout
    if (page.title === 'Logout') {
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
        this.djangoAuth.logout();
      }, 1000);
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      //alert("Login event handler");
      this.loggedIn = true;
      this.enableMenu(true);
      //this.nav.setRoot(VeeUPage);
    });

    this.events.subscribe('user:signup', () => {
      //alert("app.js:[user:signup");
      this.loggedIn = true;
      this.enableMenu(true);
      //this.nav.setRoot(ProfilePage);
    });

    this.events.subscribe('user:logged_out', () => {
      //alert("Logout event handler");
      console.log('****** djangoAuth:app.ts:listenToLoginEvents: handling user:logged_out event');
      this.loggedIn = false;
      this.enableMenu(false);
      this.nav.setRoot(HomePage);
    });
  }

  enableMenu(loggedIn) {
    this.menu.enable(loggedIn, "loggedInMenu");
    this.menu.enable(!loggedIn, "loggedOutMenu");
    /*
     this.userData.veeuID().then((veeuID) => {
     alert('ID='+veeuID);
     if (veeuID < 21 && veeuID > 17) this.userIsModerator = true;
     else this.userIsModerator = false;
     alert('userIsModerator ='+this.userIsModerator);
     });
     */
  }
}

/*
ionicBootstrap(MyApp, [HTTP_PROVIDERS,
  DjangoAuth,
  ImageData,
  {provide:XSRFStrategy, useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken')}]);
*/

