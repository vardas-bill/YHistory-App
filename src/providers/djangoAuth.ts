// Original Javascript source for this code: https://github.com/Tivix/angular-django-registration-auth
//
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { NativeStorage } from 'ionic-native';
import { Http, Headers, RequestOptions } from '@angular/http';
//import {API_ENDPOINT} from '../app_settings';
import { AUTH_ENDPOINT } from '../app_settings';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

@Injectable()
export class DjangoAuth {


  //!!.service('djangoAuth', function djangoAuth($q, $http, $cookies, $rootScope) {
  // AngularJS will instantiate a singleton by calling "new" on this function

  /* START CUSTOMIZATION HERE */
  // Change this to point to your Django REST Auth API
  // e.g. /api/rest-auth  (DO NOT INCLUDE ENDING SLASH)
  API_URL:any = AUTH_ENDPOINT;
  // Set use_session to true to use Django sessions to store security token.
  // Set use_session to false to store the security token locally and transmit it as a custom header.
  use_session:any =  false;
  /* END OF CUSTOMIZATION */
  authenticated:any = null;
  authPromise:any = null;
  token:any = null;

  constructor(public http: Http,
              public events: Events,
              public storage: Storage) {
    this.http = http;
  }


  // returns a promise that resolves to headers
  createHeaders(addApplicationJSON) {
    var headers = new Headers();
    if (addApplicationJSON) headers.append('Content-Type', 'application/json');
    //else headers.append('Content-Type', 'undefined');

    // Retrieve the token from the local storage, if available
    return this.storage.get('token').then((value) => {
      if (value) headers.append('Authorization', 'Token ' + value);
      return headers;
    });
  }

  // Make an HTTP request (called by login, signup, etc.)
  //
  // args.url = API call to be added onto end of url (e.g: '/register/')
  // args.method = GET | POST | PATCH
  // args.data = Data to be sent with HTTP call
  //
  request(args) {

    console.log('****** djangoAuth:request[1]: Just called with args = '+JSON.stringify(args));

    var theArgs = args;

    // Create the HTTP header then do the HTTP call
    // [true param causes application/json to be added to headers]
    return this.createHeaders(true).then((headers) => {
      console.log('******:djangoAuth:request[3] HEADERS request headers to be used are: ' + JSON.stringify(headers.toJSON()));

      //args = args || {};

      var url = this.API_URL + theArgs.url;
      console.log('******:djangoAuth:request ARGS.METHOD=' + theArgs.method);
      var method = theArgs.method;
      var data = theArgs.data || {};
      //console.log('******** method='+method);
      //console.log('******** url ='+url);

      // NOTE: RequestOptions is described here: https://angular.io/docs/ts/latest/api/http/index/RequestOptions-class.html
      var options = new RequestOptions({headers: headers, withCredentials: this.use_session});

      // NOTE: In the caller: .then() gets the resolve, and .catch() gets the reject
      // Fire the request, as configured by RequestOptions.
      return new Promise((resolve, reject) => {

        if (method == 'GET') {
          //alert('About to do get for url: '+url+', headers= '+headers.toJSON());
          console.log('****** djangoAuth: GET request: url: ' + url + ', headers [4] = ' + JSON.stringify(headers.toJSON()));
          console.log('****** djangoAuth: GET request: options=' + JSON.stringify(options));
          this.http.get(url, options)
            .map(res => res.text())
            .subscribe(
              (data: any) => {
                //alert('GET data result: '+data);
                console.log('****** djangoAuth: GET request: Success data result= ' + data);
                resolve(data);
              },
              (err: any) => {
                //alert('GET err result: '+err);
                console.log("****** djangoAuth: GET request: Error data result= " + JSON.stringify(err));
                data = {};
                data['status'] = 0;
                data['non_field_errors'] = ["Could not connect to server. Please try again."];
                data['error'] = err;
                reject(data);
              },
              () => {
                console.log('****** djangoAuth:request: GET Complete');
              }
            );
        }

        else if (method == 'POST') {
          console.log('****** djangoAuth: POST request: url: ' + url + ', headers [4] = ' + JSON.stringify(headers.toJSON()));
          console.log('****** djangoAuth: POST request data= ' + JSON.stringify(data));
          console.log('****** djangoAuth: POST request: options=' + JSON.stringify(options));
          this.http.post(url,
            data,
            options)
            .map(res => res.text())
            .subscribe(
              (data: any) => {
                //alert('POST data result: '+data);
                console.log('****** djangoAuth: POST request: data result= ' + data);
                resolve(data);
              },
              (err: any) => {
                //alert('POST err result: '+err);
                console.log('****** djangoAuth: POST request: err result= ' + JSON.stringify(err));
                data = {};
                data['status'] = 0;
                data['non_field_errors'] = ["Could not connect to server. Please try again."];
                data['error'] = err;
                reject(data);
              },
              () => {
                console.log('****** djangoAuth: POST Complete');
              }
            );
        }

        else if (method == 'PATCH') {
          this.http.patch(url,
            data,
            options)
            .map(res => res.text())
            .subscribe(
              data => {
                resolve(data);
              },
              err => {
                console.log("error syncing with: " + url);
                data = {};
                data['status'] = 0;
                data['non_field_errors'] = ["Could not connect to server. Please try again."];
                data['error'] = err;
                reject(data);
              },
              () => {
                console.log('****** djangoAuth PATCH Complete');
              }
            );
        }

      });
    });
  }

  register(username,password1,password2,email){
    this.storage.set('username', username);
    this.storage.set('email', email);
    var data = {
        'username':username,
        'password1':password1,
        'password2':password2,
        'email':email
    };
    return this.request({
        'method': "POST",
        'url': "/registration/",
        'data' :data
    });
  }

  login(username,password){
    console.log('***** login called with: '+username+', '+password);
    return this.request({
        'method': "POST",
        'url': "/login/",
        'data':{
            'username':username,
            'password':password
        }
    }).then((data:any) =>{
        if(!this.use_session){
            //$http.defaults.headers.common.Authorization = 'Token ' + data.key;
          let parsedData = JSON.parse(data);
            this.storage.set('token', parsedData.key);
            console.log('****** djangoAuth:login: cookie = ' + parsedData.key);

            this.storage.get('token').then((value)=> {
              console.log('****** djangoAuth: this.storage.get("token").then = ' + value);
            });
        }
        this.authenticated = true;
        //$rootScope.$broadcast("djangoAuth.logged_in", data);
    });
  }

  logout(){
    console.log('****** djangoAuth:logout() called');
    var djangoAuth = this;
    return this.request({
        'method': "POST",
        'url': "/logout/"
    }).then((data:any) =>{
        //delete $http.defaults.headers.common.Authorization;
        NativeStorage.setItem('user', {username: "", password: ""})
        .then(
          () => console.log('djangoAuth.ts:logout: NativeStorage: cleared username and password'),
          error => console.error('Error storing item', error)
        );

      this.storage.remove('token');
        this.storage.remove('username');
        djangoAuth.authenticated = false;
        console.log('****** djangoAuth:logout(): About to publish user:logged_out event');
        this.events.publish('user:logged_out');
        //$rootScope.$broadcast("djangoAuth.logged_out");
    });
  }

  changePassword(password1,password2){
    return this.request({
        'method': "POST",
        'url': "/password/change/",
        'data':{
            'new_password1':password1,
            'new_password2':password2
        }
    });
  }

  resetPassword(email){
    return this.request({
        'method': "POST",
        'url': "/password/reset/",
        'data':{
            'email':email
        }
    });
  }

  profile(){
    return this.request({
        'method': "GET",
        'url': "/user/"
    });
  }

  updateProfile(data){
    return this.request({
        'method': "PATCH",
        'url': "/user/",
        'data':data
    });
  }

  verify(key){
    return this.request({
        'method': "POST",
        'url': "/registration/verify-email/",
        'data': {'key': key}
    });
  }

  confirmReset(uid,token,password1,password2){
    return this.request({
        'method': "POST",
        'url': "/password/reset/confirm/",
        'data':{
            'uid': uid,
            'token': token,
            'new_password1':password1,
            'new_password2':password2
        }
    });
  }

  authenticationStatus(){
    console.log('****** authenticationStatus: Called');
    // Set restrict to true to reject the promise if not logged in
    // Set to false or omit to resolve when status is known
    // Set force to true to ignore stored value and query API
    return this.request({
        'method': "GET",
        'url': "/user/"
      })
      .then((data:any) => {
          console.log('****** authenticationStatus: GET /user/ SUCCESS');
      });

    /* :TO DO: Original code - not sure if this is needed
    var djangoAuth = this;
    return new Promise((resolve,reject) => {
      if (this.authenticated != null && !force) {
        // We have a stored value which means we can pass it back right away.
        if (this.authenticated == false && restrict) {
          reject("User is not logged in.");
        } else {
          resolve();
        }
      } else {
        // There isn't a stored value, or we're forcing a request back to
        // the API to get the authentication status.
        this.authPromise.then(function () {
          djangoAuth.authenticated = true;
          resolve();
        }, function () {
          djangoAuth.authenticated = false;
          if (restrict) {
            reject("User is not logged in.");
          } else {
            resolve();
          }
        });
      }
    });
    */
  }


  initialize(url, sessions){
    this.API_URL = url;
    this.use_session = sessions;
  }

  getAuthToken(){
      return this.storage.get('token').then((value) => {
        return value;
      });
  }
  getCsrfToken(){
    return this.storage.get('csrftoken').then((value) => {
      return value;
    });
  }
  getUsername(){
    return this.storage.get('username').then((value) => {
      return value;
    });
  }
  getEmail(){
    return this.storage.get('email').then((value) => {
      return value;
    });
  }

  removeUsername(){
    this.storage.remove('username');
  }
  removeAuthToken(){
    this.storage.remove('token');
    this.token = null;
  }
  removeEmail(){
    this.storage.remove('email');
  }
  removeCsrftoken(){
    this.storage.remove('csrftoekn');
  }

  setUsername(username){
    this.storage.set('username', username);
  }
  setAuthToken(token){
    this.storage.set('token', token);
    this.token = token;
  }
  setEmail(email){
    this.storage.set('email', email);
  }
  setCsrftoken(csrftoken){
    this.storage.set('csrftoekn', csrftoken);
  }
}
