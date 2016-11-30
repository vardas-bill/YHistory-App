import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Http, RequestOptions } from '@angular/http';
import { API_ENDPOINT } from '../app_settings';
import { DjangoAuth } from '../providers/djangoAuth';
//import { Observable } from 'rxjs/Observable';
//import 'rxjs/add/operator/map';


@Injectable()
export class ImageData {

  userID:number  = 0;
  username:any = "";
  data:any;
  httpBody:any;

  constructor(public http: Http, public events: Events, public djangoAuth: DjangoAuth) {

  }

  // TEST CODE
  processData(param){
    return param;
  }

  loadImages(theUsername, numberItemsToGet, feedType){
    this.username = theUsername;
    // Get data (including urls) for images
    var additional_parameters = '';
    var theCategoriesWanted = 'ALL';

    // Are we getting the user's submitted items or items they haven't seen?
    if (feedType == 'USERS'){
      additional_parameters = '&fromthisuser=true';
      theCategoriesWanted = 'ALL';
    }
    else if (feedType == 'UNSEEN'){
      additional_parameters = '';
    }
    else if (feedType == 'BOOKMARKS'){
      additional_parameters = '&bookmarked=True'+this.userID;
      theCategoriesWanted = 'ALL';
    }

    return this.djangoAuth.createHeaders(true).then((headers) => {
      console.log('******:imageData:loadImages HEADERS request headers to be used are: ' + JSON.stringify(headers.toJSON()));

      // NOTE: RequestOptions is described here: https://angular.io/docs/ts/latest/api/http/index/RequestOptions-class.html
      var options = new RequestOptions({headers: headers, withCredentials: this.djangoAuth.use_session});
/*
      return new Promise(resolve => {
        // We're using Angular Http provider to request the data,
        // then on the response it'll map the JSON data to a parsed JS object.
        // Next we process the data and resolve the promise with the new data.
        this.http.get(API_ENDPOINT + 'items/?categories=' + theCategoriesWanted + '&num=' + numberItemsToGet + '&user=' + this.userID + '&format=json' + additional_parameters, options)
          .subscribe(res => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            //this.data = res.json();
            resolve(res.json());
          },
          (err: any) => {
            //alert("Error! api/items/ failed: " + JSON.stringify(err));
            resolve("api/items returned error: " + err);
          },
          () => {
            //alert('Complete');
          });
      });
*/

      return new Promise(resolve => {
        this.http.get(API_ENDPOINT + 'items/?categories=' + theCategoriesWanted + '&num=' + numberItemsToGet + '&user=' + this.username + '&format=json' + additional_parameters, options)
          .map(res => res.json())
          .subscribe(
            (data: any) => {
              console.log('++++++ imageData:loadImages: In success of .subscribe');
              //alert('imageData: loadImages: API call returned - ' + JSON.stringify(data));
              this.data = data;
              resolve(this.data);
            },
            (err: any) => {
              console.log('++++++ imageData:loadImages: In err of .subscribe. Error = '+err);
              //alert("Error! api/items/ failed: " + JSON.stringify(err));
              resolve("api/items returned error: " + err);
            },
            () => {
              console.log('++++++ imageData:loadImages: In done of .subscribe');
              //alert('Complete');
            }
          );
      });
    });
  }

  /* :TO DO: Rewrite this VeeU code for LIKE/DISLIKE/BOOKMARK/REMOVEBOOKMARK/REPORT so it works with this app
  recordLike(itemID, liked){
    let body = JSON.stringify({item_seen: itemID, who_saw: this.userID, liked: liked});
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(API_ENDPOINT+'seen/ ',
      body, {
        headers: headers
      })
      .map(res => res.json())
      .subscribe(
        data => {
          //alert('DATA returned from record like API call: ' + JSON.stringify(data));
        },
        err => {
          //if (err.statusText != 'Ok') alert('ERROR from recordLike() API call. Sent: '+this.httpBody+', ERROR:' + JSON.stringify(err));
        },
        () => {
          //alert('Complete');
        }
      );
  }

  saveBookmark(itemID){
    //alert('saveBookmark called');
    // Get user's id
    this.userData.veeuID().then((veeuID) => {
      //alert('inside recordLike this.userData.veeuID().then. itemID= '+itemID+', veeuID='+veeuID);
      this.userID = veeuID;

      let body = JSON.stringify({item: itemID, user: this.userID});
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.http.post(API_ENDPOINT+'bookmark/ ',
        body, {
          headers: headers
        })
        .map(res => res.json())
        .subscribe(
          data => {
            //alert('DATA returned from save bookmark API call: ' + JSON.stringify(data));
          },
          err => {
            //alert('ERROR from saveBookmark() API call: ' + JSON.stringify(err));
          },
          () => {
            //alert('Complete');
          }
        );
    });
  }

  removeBookmark(itemID){
    //alert('removeBookmark called');
    // Get user's id
    this.userData.veeuID().then((veeuID) => {
      //alert('inside recordLike this.userData.veeuID().then. itemID= '+itemID+', veeuID='+veeuID);
      this.userID = veeuID;

      let body = '?item='+itemID+'&user='+this.userID+'&remove=true';
      //alert('about to do http delete with:'+body);
      this.http.delete(API_ENDPOINT+'bookmark/'+body)
        .subscribe(
          data => {
            //alert('DATA returned from save bookmark API call: ' + JSON.stringify(data));
          },
          err => {
            //alert('ERROR from saveBookmark() API call: ' + JSON.stringify(err));
          },
          () => {
            //alert('Complete');
          }
        );
    });
  }

  // Empties the record of which items this user has seen
  emptySeenList(){
    //alert('A');
    // Get user's id
    this.userData.veeuID().then((veeuID) => {
      //alert('inside recordLike this.userData.veeuID().then. itemID= '+itemID+', veeuID='+veeuID);
      this.userID = veeuID;
      //alert(veeuID);

      let body = '?item_seen=0&who_saw='+this.userID+'&liked=0&empty=true';
      this.http.delete(API_ENDPOINT+'seen/'+body)
        .subscribe(
          data => {
            //alert('DATA returned from Empty Seen List API call: ' + JSON.stringify(data));
          },
          err => {
            //alert('ERROR from emptySeenList() API call: ' + JSON.stringify(err));
          },
          () => {
            //alert('Complete');
          }
        );
    });
  }

  // Let user report image as inappropriate
  reportImage(itemID, reportType, reportComment) {
    // Get user's id
    this.userData.veeuID().then((veeuID) => {
      this.userID = veeuID;

      let reason = reportType + ':' + reportComment;
      let body = JSON.stringify({item: itemID, user: this.userID, reason: reason});
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.http.post(API_ENDPOINT+'report/ ',
          body, {
            headers: headers
          })
          .map(res => res.json())
          .subscribe(
              data => {
                //alert('DATA returned from save bookmark API call: ' + JSON.stringify(data));
              },
              err => {
                //alert('ERROR from saveBookmark() API call: ' + JSON.stringify(err));
              },
              () => {
                //alert('Complete');
              }
          );
    });
  }
  */

  /* :TO DO: Rewrite these VeeU ADMIN functions so they work with this app?
  // ADMIN FUNCTIONS (for authorised administrators)
  // ===============================================

  loadItemsToBeModerated(theUserID, numberItemsToGet){
    this.userID = theUserID;

    var numItems = numberItemsToGet;

    return new Promise(resolve => {
        this.http.get(API_ENDPOINT+'moderate/?num='+numItems+'&user='+this.userID+'&format=json')
            .map(res => res.json())
            .subscribe(
                data => {
                    //alert(JSON.stringify(data));
                    this.data = data;
                    resolve(this.data);
                },
                err => {
                    //alert("Error! api/items/ failed: "+JSON.stringify(err));
                },
                () => {
                    //alert('Complete');
                }
            );
    });
  }

  // Record result of moderation of a submitted or reported item
  recordModeration(itemID, type, approved){
    // Get user's id
    this.userData.veeuID().then((veeuID) => {
      //alert('inside recordLike this.userData.veeuID().then. itemID= '+itemID+', veeuID='+veeuID);
      this.userID = veeuID;

      let body = JSON.stringify({item_seen: itemID, who_saw: this.userID, approved: approved, type: type});
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.http.post(API_ENDPOINT+'approve/ ',
          body, {
            headers: headers
          })
          .map(res => res.json())
          .subscribe(
              data => {
                //alert('DATA returned from record like API call: ' + JSON.stringify(data));
              },
              err => {
                //if (err.statusText != 'Ok') alert('ERROR from recordLike() API call. Sent: '+this.httpBody+', ERROR:' + JSON.stringify(err));
              },
              () => {
                //alert('Complete');
              }
          );
    });
  }

  // Get outstanding items that have been reported as inappropriate and need moderating
  loadItemsReported(theUserID, numberItemsToGet){
    this.userID = theUserID;

    var numItems = numberItemsToGet;

    return new Promise(resolve => {
      this.http.get(API_ENDPOINT+'reported/?num='+numItems+'&user='+this.userID+'&format=json')
          .map(res => res.json())
          .subscribe(
              data => {
                //alert(JSON.stringify(data));
                this.data = data;
                resolve(this.data);
              },
              err => {
                //alert("Error! api/items/ failed: "+JSON.stringify(err));
              },
              () => {
                //alert('Complete');
              }
          );
    });
  }
  */
}
