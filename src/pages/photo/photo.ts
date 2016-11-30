import { NavController, Events, AlertController, Platform, LoadingController } from 'ionic-angular';
import { NgZone, Component } from '@angular/core';
import { Camera, Transfer, NativeStorage } from 'ionic-native';
import { API_ENDPOINT } from '../../app_settings';
import { DjangoAuth } from '../../providers/djangoAuth';

@Component({
  templateUrl: 'photo.html',
})
export class PhotoPage {

  submitMediaItem:any = {};
  tandc:boolean = false;
  submiting:boolean = false;
  userID:number = 0;
  loading:any;
  data:any;
  zone:any;
  theImage:any;
  showInstructions:boolean = false;
  title:any = "";
  latitude:any = "";
  longitude:any = "";
  dateTime:any = "";
  event:boolean = false;
  nature:boolean = false;
  architecture:boolean = false;
  username:any = "";

  progress: number;
  // SEE: https://github.com/dtaalbers/ionic-2-examples/blob/master/file-transfer-upload/app/pages/uploading/uploading.ts

  constructor(public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public nav : NavController,
              public ngzone : NgZone,
              public camera: Camera,
              public events : Events,
              public djangoAuth : DjangoAuth,
              public platform : Platform){
    this.zone = ngzone;

    //this.listenToSubmittedEvents();
  }

  addPhoto(){
    var options = {
      quality: 75,
      //destinationType: navigator.camera.DestinationType.DATA_URL, // For file transfer (rather than display) use FILE_URL
      destinationType: Camera.DestinationType.FILE_URI, // For file transfer (rather than display) use FILE_URL
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      //allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      //targetWidth: 1000,
      //targetHeight: 1000,
      //popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    this.loading = this.loadingCtrl.create({
      content: 'Getting photo...',
      spinner: 'crescent'
    });
    this.loading.present();

    /*
    // Make sure we are never permanently stuck with the loading widget if something goes wrong with server result
    setTimeout(()=> {
      this.loading.dismiss();
    }, 10000);
    */

    // Get the user's username to make sure they are logged in before selecting an image to submit
    NativeStorage.getItem('user')
      .then(
        data => {
          console.log('****** photo.ts:addPhoto:NativeStorage.getItem username = '+ data.username);
          if (data.username == "") {
            this.showAlert('Please Login', 'You need to be logged in to submit images.');
          }
          else {
            this.username = data.username;

            Camera.getPicture(options).then((data:any) => {
              //alert('Data='+data);
              //alert('Camera.EncodingType.JPEG='+Camera.EncodingType.JPEG+', Camera.DestinationType.FILE_URI='+Camera.DestinationType.FILE_URI);
              var thisResult = JSON.parse(data);
              //alert('getPicture returned: '+thisResult);
              var metadata = JSON.parse(thisResult.json_metadata);
              this.data = thisResult.filename;
              if (metadata != "{}") {
                //alert('GetPicture Data Returned exif data: '+ thisResult.json_metadata);
                // iOS and Android return the exif and gps differently and I am not converting or accounting for the Lat/Lon reference.
                if (this.platform.is('ios')) {
                  //alert('Platform is ios');
                  if (metadata && typeof metadata.GPS != 'undefined' && typeof metadata.GPS.Latitude != 'undefined') {
                    this.latitude = metadata.GPS.Latitude;
                    this.longitude = metadata.GPS.Longitude;
                    if (metadata.GPS.LatitudeRef == 'S') this.latitude = -this.latitude;
                    if (metadata.GPS.LongitudeRef == 'W') this.longitude = -this.longitude;
                    this.dateTime = metadata.Exif.DateTimeOriginal;
                    //alert('metadata.GPS.Latitude: ' + metadata.GPS.Latitude + ' metadata.GPS.Longitude: ' + metadata.GPS.Longitude + 'this.Latitude: ' + this.latitude + ' this.Longitude: ' + this.longitude);
                    //alert('DateTimeOriginal: ' + metadata.Exif.DateTimeOriginal);
                  }
                  else
                  {
                    this.showAlert('Incompatible Image', 'The image you selected does not have location information. Only images with location and date information can be submitted.');
                    this.latitude = '';
                    this.longitude = '';
                    this.dateTime = '';
                  }
                }
                else {
                  //alert('Platform is not ios');
                  if (metadata && typeof metadata.gpsLatitude != 'undefined') {
                    this.latitude = metadata.gpsLatitude;
                    this.longitude = metadata.gpsLongitude;
                    this.dateTime = metadata.Exif.DateTimeOriginal;
                    //alert('Lat: ' + metadata.gpsLatitude + ' Lon: ' + metadata.gpsLongitude);
                    //alert('DateTimeOriginal: ' + metadata.Exif.DateTimeOriginal);
                  }
                  else
                  {
                    this.showAlert('Incompatible Image', 'The image you selected does not have location information. Only images with location and date information can be submitted.');
                    this.latitude = '';
                    this.longitude = '';
                    this.dateTime = '';
                  }
                }
              }
              else {
                this.showAlert('Incompatible Image', 'Image does not have location information');
                this.latitude = '';
                this.longitude = '';
                this.dateTime = '';
              }

              this.zone.run(()=> {
                this.theImage = thisResult.filename;
                this.loading.dismiss();
              });
            }, (err:any) => {
              //alert('in getPicture err');
              this.loading.dismiss();
              this.submiting = false;
              this.showAlert("Couldn't Get Photo", err);
            });
          }
        },
        error => {
          console.error('****** photo.ts:addPhoto:NativeStorage.getItem FAILED with error = '+ error);
          this.showAlert('Please Login', 'You must be logged in to submit images');
        }
      );
  }

  onSubmit(form) {
    // Submit the item to YHistory
    if (this.latitude == ''){
      this.showAlert('Incompatible Image', 'The image you selected does not have location information. Only images with location and date information can be submitted.');
      return;
    }

    if (form.valid) {
      this.title = '';
      if (this.submitMediaItem.title) this.title = this.submitMediaItem.title + ' ';

      // Add category tags to end of title/description
      if (this.event) {
        this.title = this.title + '[event] ';
      }
      if (this.nature) {
        this.title = this.title + '[nature] ';
      }
      if (this.architecture) {
        this.title = this.title + '[man made] ';
      }

      this.userID = 1;

      this.platform.ready().then(() => {

        if (this.platform.is('cordova')) {

          var fileURL = this.data;

          // Create http headers then do upload
          // false param prevents application/json being added to headers
          this.djangoAuth.createHeaders(false).then((headers) => {

            var now = Date.now();

            const ft = new Transfer();
            var options:any;
            // NOTE: this.dateTime must be in format: "%Y:%m:%d %H:%M:%S"
            options = {
              fileKey: "photo",
              fileName: this.username + '_' + now + '_' + fileURL.substr(fileURL.lastIndexOf('/') + 1),
              mimeType: "image/jpeg",
              httpMethod: "post",
              params: {
                user_id: 1, // This is ignored
                title: this.title,
                item_type: 'P',
                latitude: this.latitude,
                longitude: this.longitude,
                timestamp: this.dateTime,
                username: this.username
              },
              chunkedMode: false, // Doesn't work without this!
              /*
              headers: {
                'Content-Type' : undefined
              }
              */
              headers: {}
            };

            options.headers = headers;

            console.log('****** photo.ts: createHeaders() returned headers: '+ JSON.stringify(headers.toJSON()));
            console.log('****** photo.ts: inside createHeaders().then options: '+JSON.stringify(options));

            this.loading = this.loadingCtrl.create({
              content: 'Submitting photo...',
              spinner: 'crescent'
            });
            this.loading.present();

            // Make sure we are never permanently stuck with the loading widget if something goes wrong with server result
            setTimeout(()=> {
              this.loading.dismiss();
            }, 99000);

            //alert('About to do ft.upload with file (this.data) = '+this.data+', and options = '+JSON.stringify(options));

            ft.upload(this.data, encodeURI(API_ENDPOINT + 'photoupload/'), options, true)
              .then((result: any) => {
                this.submiting = false; // Clear submitted flag
                // Signify photo submission was successful
                //this.events.publish('submitted:success');
                this.loading.dismiss();
                let alert = this.alertCtrl.create({
                  title: 'Done!',
                  subTitle: 'Your photo was been uploaded and is now waiting to be approved (this can take up to 3 days). Thank you for contributing to the World Image Archive.',
                  buttons: [
                    {
                      text: 'Ok',
                      handler: data => {
                        //this.nav.setRoot(HomePage);
                      }
                    }
                  ],
                });
                alert.present(alert);
                this.theImage = '';
                this.title = '';
                this.submitMediaItem.title = '';
                //this.success(result);
              })
              .catch((error: any) => {
                console.log('****** PhotoPage: image upload failed with error:'+JSON.stringify(error));
                this.loading.dismiss();
                this.showAlert('Problem Uploading Image', 'Image upload failed');
                this.submiting = false; // Clear submitted flag
                //this.failed(error);
              });
          });
        }
      });
    }
  }

  showPageInstructions() {
    this.showInstructions = true;
    //this.storage.set(this.DONE_PHOTOS_POPUP, true);
  }

  closeInstructions(){
    this.showInstructions = false;
  }

  showTerms(){
    let alert = this.alertCtrl.create({
      title: 'Terms and Conditions',
      subTitle: "You must not upload any images which are illegal, are offensive, or violate the copyright of others. " +
      "Persistant submission of images which violate these rules will result in your account being terminated.",
      buttons: ['Ok']
    });
    alert.present(alert);
    return;
  }

  categoryHelp() {
    this.showAlert('Image Types','<br />Please select one or more of the following image types:<br /><br />Event (e.g. concerts, earthquakes, riots, weddings, protests, birthday parties, floods, holiday, exhibitions ...)' +
      '<br /><br />Nature (e.g. landscape, sea, fields, rivers, mountains, ...)' +
      '<br /><br />Man Made (e.g. buildings, art, bridges, boats, food, roads, clothes, ...)');
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
