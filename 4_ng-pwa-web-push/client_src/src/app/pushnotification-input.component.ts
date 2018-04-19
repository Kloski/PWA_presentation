import { Component, OnInit } from '@angular/core';
import { PushService } from './push.service';
import { Message } from './message';

@Component({
  selector: 'push-message-input',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <form (ngSubmit)="onSubmit()" #messageForm="ngForm">

      <div class="form-group">
        <label for="name"><b>Title</b></label>
        <input type="text" class="form-control" id="title" [(ngModel)]="message.title" name="title" #title="ngModel" required>
        <div [hidden]="title.valid || title.pristine" class="alert alert-danger">
          Title is required
        </div>
      </div>
 
      <div class="form-group">
        <label for="alterEgo"><b>Body</b></label>
        <textarea name="body" rows="10" cols="60" class="form-control" id="body" [(ngModel)]="message.body" name="body" #body="ngModel" required></textarea>
        <div [hidden]="body.valid || body.pristine" class="alert alert-danger">
          Body is required
        </div>
      </div>
 
      <button type="submit" class="btn btn-success" [disabled]="!messageForm.form.valid">Submit</button>
    </form>
  `,
  styles: []
})
export class PushNotificationInfoComponent implements OnInit {

  message :Message = {title: '', body:''};

  constructor(private pushService: PushService) { }

  ngOnInit(){ }
 
  onSubmit() { 
    var requestObservable = this.pushService.broadcastPushNotificationMessage(this.message);
    requestObservable.subscribe( ro => {
      console.log(ro);
      this.message = {title: '', body:''};
    });
   }
}
