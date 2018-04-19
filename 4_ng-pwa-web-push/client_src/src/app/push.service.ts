import 'rxjs/add/observable/throw';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';

import { Observable } from 'rxjs/Observable';
import { Message } from './message';

/**
 * https://github.com/webmaxru/pwatter/blob/ngsw/src/app/push.service.ts
 * https://medium.com/google-developer-experts/a-new-angular-service-worker-creating-automatic-progressive-web-apps-part-2-practice-3221471269a1
 */
@Injectable()
export class PushService {

    // https://web-push-codelab.glitch.me/    
    // prod
    private VAPID_PUBLIC_KEY = 'BDI2SYO91ahlih1EblRqnW-av2HXQkmH2eZoDisFaoUiZIDf0pesjC_p5sKZfR7WlyHGflNnEDWmbD0Jw1ylPQc';
    // dev 
    // private VAPID_PUBLIC_KEY = 'BHVjDbTwvg4ejxUk3inYP3ct8WdT7Zq4rV09A9IUWWV1LrKJeCjpSj1n3qrASJGYFuyKQ1srGvMwcPnnXjTtQx8';
    private WEBPUSH_URL = '/push-notifications-api';

    constructor(private http: HttpClient, private swPush: SwPush) { }

    // TODO: https://serviceworke.rs/push-clients_demo.html
    showNotification(notification: WebPushNotificationMessage) {
        navigator.serviceWorker.getRegistration().then(registration => {
            return registration.showNotification(notification.Topic, {
                body: notification.Content,
                icon: 'favicon.ico'
            });
        });
    }

    broadcastPushNotificationMessage(message : Message){
        console.log(message);

        var requestObservable = this.http
            .post(`${this.WEBPUSH_URL}/notifications`, { topic: message.title, notification: message.body})
            .catch(this.handleError);
        
        return requestObservable;
    }

    addSubscriberToBackend(subscription) {
        const subscribeUrl = `${this.WEBPUSH_URL}/subscriptions`;
        console.log('[Push Service] Adding subscriber');

        return this.http
            .post(subscribeUrl, subscription)
            .catch(this.handleError);

    }

    registerSubscription() {
        console.log("registerSubscription called...");
        this.swPush.subscription
            .take(1)
            .subscribe(pushSubscription => {
                if (pushSubscription == null) {
                    console.log('[App] There is no client/browser registration. New will be created.');

                    // Requesting messaging service to subscribe current client (browser)
                    this.swPush.requestSubscription({ serverPublicKey: this.VAPID_PUBLIC_KEY })
                        .then(newPushSubscription => {
                            // console.log('Push subscription:', pushSubscription);

                            // Passing subscription object to our backend
                            this.addSubscriberToBackend(newPushSubscription)
                                .subscribe(res => {
                                    console.log('[App] Add subscriber request answer', res);

                                    this.showNotification({ Topic: 'Subsctiption', Content: 'Now you are subscribed for web notifications!' } as any);
                                },
                                err => {
                                    console.error('[App] Add subscriber request failed', err);
                                });
                        })
                        .catch(err => {
                            console.error(err);
                        });
                } else {
                    console.log('[App] Client/browser is already registered but subscription will be send to backend', pushSubscription);

                    // Passing subscription object to our backend
                    this.addSubscriberToBackend(pushSubscription)
                        .subscribe(res => {
                            console.log('[App] Add existing subscriber request answer', res);

                            // this.showNotification({ title: 'Subsctiption', body: 'Existing subscription was posted to backend.' });
                        },
                        err => {
                            console.error('[App] Add EXISTING subscriber request failed', err);
                        });
                }
            }
            );
    }

    deleteSubscriberFromBackend(subscription) {
        const unsubscribeUrl = `${this.WEBPUSH_URL}/subscriptions`;
        console.log('[Push Service] Deleting subscriber');

        return this.http
            .delete(unsubscribeUrl, subscription)
            .catch(this.handleError);

    }

    unsubscribeFromPush() {
        // Get active subscription
        this.swPush.subscription
            .take(1)
            .subscribe(pushSubscription => {
                console.log('[App] pushSubscription', pushSubscription);

                // Delete the subscription from the backend
                this.deleteSubscriberFromBackend(pushSubscription)
                    .subscribe(res => {
                        console.log('[App] Delete subscriber request answer', res);

                        var notifMessage = {Topic: 'Subsctiption', Content: 'Now you are now UNsubscribed from web notifications' } as any;
                        this.showNotification(notifMessage);

                        // Unsubscribe current client (browser)
                        pushSubscription.unsubscribe()
                            .then(success => {
                                console.log('[App] Unsubscription successful', success);
                            })
                            .catch(err => {
                                console.log('[App] Unsubscription failed', err);
                            });
                    },
                    err => {
                        console.log('[App] Delete subscription request failed', err);
                    });
            });
    }

    subscribeMessages() {
        this.swPush.messages
            .subscribe((message: any) => {
                console.log("Obtained message: ", message);
                this.showNotification(message);
            });
    }

    private urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            errMsg = `${error.statusText || 'Network error'}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        return Observable.throw(errMsg);
    }
}

interface WebPushNotificationMessage extends NotificationOptions {
    /// <summary>
    /// Gets or sets the topic (used to correlate messages sent to the same subscription).
    /// </summary>
    Topic:string;

    /// <summary>
    /// Gets or sets the content.
    /// </summary>
    Content:string;

    /// <summary>
    /// Gets or sets the time (in seconds) for which the message should be retained by push service.
    /// </summary>
    TimeToLive:string;

    /// <summary>
    /// Gets or sets the message urgency.
    /// </summary>
    Urgency:number;
}
