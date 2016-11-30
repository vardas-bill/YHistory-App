import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { Http } from '@angular/http';
//import { XSRFStrategy, CookieXSRFStrategy  } from '@angular/http';
import { Storage  } from '@ionic/storage';
import { FormsModule }   from '@angular/forms';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { GalleryPage } from '../pages/gallery/gallery';
import { SubmittedPage } from '../pages/submitted/submitted';
import { PhotoPage } from '../pages/photo/photo';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { SignupPage } from '../pages/signup/signup';
import { DjangoAuth } from '../providers/djangoAuth';
import { ImageData } from '../providers/imageData';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    LoginPage,
    PhotoPage,
    GalleryPage,
    SubmittedPage,
    ResetPasswordPage,
    SignupPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, [
      Http,
      DjangoAuth,
      ImageData,
      FormsModule,
      //{provide:XSRFStrategy, useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken')}
    ])
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    LoginPage,
    PhotoPage,
    GalleryPage,
    SubmittedPage,
    ResetPasswordPage,
    SignupPage
  ],
  providers: [
    DjangoAuth,
    ImageData,
    Storage,
    Camera
  ]
})

export class AppModule {}
