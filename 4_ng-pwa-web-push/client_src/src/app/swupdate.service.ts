import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { PushService } from './push.service';


@Injectable()
export class SwUpdateService {

    constructor(private updates: SwUpdate, private pushService: PushService) {
        updates.available.subscribe(event => {
            console.log('[App] Update available: current version is', event.current, 'available version is', event.available);

            // this.showNotification('App update is available. Current version: ${event.current}; available version: ${event.available}');
            this.pushService.showNotification({
                Topic: 'Newer version is available!',
                Content: `Current version is ${event.current.hash}, available version is ${event.available.hash}. 
                To update refresh your web page.`,
                TimeToLive:'2',
                Urgency:2
            });
            // TODO: add click handler to automatic window refresh ? // window.location.reload();
        });
        updates.activated.subscribe(event => {
            console.log('[App] was updated: old version was', event.previous, 'new version is', event.current);

            // this.showNotification('App was updated. old version: ${event.previous}; new version: ${event.current}');
            this.pushService.showNotification({
                Topic: 'App was updated!',
                Content: `Old version was ${event.previous.hash}, new version is ${event.current.hash}.`,
                TimeToLive:'2',
                Urgency:2
            });
        });
    }

    // TODO: not used yet
    checkForUpdate() {
        console.log('[App] checkForUpdate started');
        this.updates.checkForUpdate()
            .then(() => {
                console.log('[App] checkForUpdate completed');
            })
            .catch(err => {
                console.error(err);
            });
    }

    // TODO: not used yet
    activateUpdate() {
        console.log('[App] activateUpdate started');
        this.updates.activateUpdate()
            .then(() => {
                console.log('[App] activateUpdate completed');
                window.location.reload();
            })
            .catch(err => {
                console.error(err);
            });
    }

    showNotification(message: string) {
        navigator.serviceWorker.getRegistration().then(registration => {
            return registration.showNotification('BW - SwUpdate service', {
                body: message,
                icon: 'favicon.ico'
            });
        });
    }
}
