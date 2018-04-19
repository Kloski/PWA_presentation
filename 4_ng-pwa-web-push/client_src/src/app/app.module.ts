import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/zip';

import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app.component';
import { PushService } from './push.service';

import { environment } from '../environments/environment';
import { PushNotificationInfoComponent } from './pushnotification-input.component';
import { SwUpdateService } from './swupdate.service';

@NgModule({
  declarations: [
    AppComponent,
    PushNotificationInfoComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,    
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [PushService, SwUpdateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
