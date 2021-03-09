import { PushNotificationModel } from "../models/push-notification-model";
import { PushSubscriptionModel } from "../models/push-subscription-model";
import { PushRegistrationModel } from "../models/push-registration-model";
import { DatabaseHelper } from "./database-helper";

const webpush = require('web-push');

export class WebPushHelper {
    
    // Use this function to generate the VAPID keys.
    // Store them in the .env config file.
    static generateVAPIDKeys() {
        
        const vapidKeys = webpush.generateVAPIDKeys();
        
        // Prints 2 URL Safe Base64 Encoded Strings
        console.log(vapidKeys.publicKey, vapidKeys.privateKey);

        return vapidKeys;
    }

    static async sendNotification(registration: PushRegistrationModel, notification: PushNotificationModel) {

        const subscriptions = await DatabaseHelper.getSubscriptionsAsync(registration.publicKey);

        const options = {
            //gcmAPIKey: '< GCM API Key >',
            vapidDetails: registration,
            //TTL: <Number>,
            //headers: {
            //  '< header name >': '< header value >'
            //},
            //contentEncoding: '< Encoding type, e.g.: aesgcm (default) or aes128gcm >',
            //proxy: '< proxy server options >',
            //agent: '< https.Agent instance >'
        }

        // TODO: Batch the push to all subscribers.
        for (var i = 0; i < subscriptions.length; i++) { 
        
            const subscription = new PushSubscriptionModel(subscriptions[i]);

            try {

                await webpush.sendNotification(subscription, notification.getPayload(), options);
            }
            catch(e) {

                // TODO: Any failed notifications should have the subscription removed from the DB.
                console.log(e);
            }
        };
    }
}