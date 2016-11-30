import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, Events } from 'ionic-angular';
import { DjangoAuth } from '../../providers/djangoAuth';
import { ImageData } from '../../providers/imageData';
import { NativeStorage } from 'ionic-native';

@Component({
  templateUrl: 'submitted.html',
})
export class SubmittedPage {

  loading: any;
  itemCount: any;
  itemIndex: any;
  imageItems: any = [];
  theImageItem: any = [];
  theUserData: any = [];
  endOfFeed: boolean = false;
  usernameText: any;

  // From example code...
  images: Array<string>;
  grid: Array<Array<string>>; //array of arrays

  constructor(public loadingCtrl: LoadingController, public alertCtrl: AlertController, public nav: NavController, public navParams: NavParams, public djangoAuth: DjangoAuth, public imageData: ImageData, public events: Events) {
    //alert('gallery.ts constructor');
    this.getImages();
  }

  getImages() {

    // :NEW: Get username from global storage


    this.loading = this.loadingCtrl.create({
      content: 'Loading images...',
      spinner: 'crescent'
    });

    this.loading.present();

    // Make sure we are never permanently stuck with the loading widget if something goes wrong with server result
    setTimeout(()=> {
      this.loading.dismiss();
    }, 64000);


//alert('Running getMediaItemData');
    var userId = 0;
    var numItemsToGet = 50;
    var feedType = "USERS"; // Get user's images

    // Get the user's username then get the images associated with that username
    NativeStorage.getItem('user')
      .then(
        data => {
          console.log('****** submitted.ts:getImages:NativeStorage.getItem = '+ data.username);
          if (data.username == ""){
            this.showAlert('Please Login', 'You need to login to see the most recent images that you have submitted');
            this.loading.dismiss();
            return;
          }
          this.imageData.loadImages(data.username, numItemsToGet, feedType).then((mediaItems: any) => {
            // Remove the loading widget
            this.loading.dismiss();
            //this.showAlert('loadImages returned', JSON.stringify(mediaItems));

            this.imageItems = mediaItems.results;
            this.theUserData.viewCount = mediaItems.views;

            //alert('Num items returned = '+this.imageItems.length);
            //alert('First url is: '+this.imageItems[0].url);

            // From sample code...
            // :TO DO: Amend this code to work with mediaItems
            // Create the correct number of rows according to the number of images (two images per row)
            this.grid = Array(Math.ceil(this.imageItems.length/2)); //MATHS!
            let rowNum = 0; //counter to iterate over the rows in the grid
            for (let i = 0; i < this.imageItems.length; i+=2) { //iterate images
              this.grid[rowNum] = Array(2); //declare two elements per row
              if (this.imageItems[i].url) { //check file URI exists
                let thumbUrl = this.imageItems[i].url.replace('userphotos', 'userthumbs');
                this.grid[rowNum][0] = thumbUrl; //this.imageItems[i].url; //insert image
              }
              if (this.imageItems[i+1]) { //repeat for the second image
                let thumbUrl = this.imageItems[i+1].url.replace('userphotos', 'userthumbs');
                this.grid[rowNum][1] = thumbUrl; //this.imageItems[i+1].url;
              }
              rowNum++; //go on to the next row
            }
          },
          error => {
            this.loading.dismiss();
          });
        },
        error => {
          console.error('****** submitted.ts:getImages:NativeStorage.getItem FAILED with error = '+ error);
          this.showAlert('Please Login', 'You need to login to see the most recent images that you have submitted');
        }
      );
  }

  showImage(file_uri, i, j){
    //alert('i='+i+', j='+j+', url='+file_uri);
    let imageIndex = (i * 2) + j;
    this.showAlert('Title',this.imageItems[imageIndex].title);
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['Ok']
    });
    alert.present();
  }
}
