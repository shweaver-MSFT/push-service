import { DatabaseHelper } from '../helpers/database-helper';
import { WebPushHelper } from '../helpers/web-push-helper';
import { PushNotificationModel } from '../models/push-notification-model';
import { PushRegistrationModel } from '../models/push-registration-model';

//
export class ServiceRoutes {

    // I am a PWA, I wish to setup Push Notifications for the first time, and did not bring an existing VAPID identity.
    static keys(req, res) {
        
        try {

            // Return a fresh set of VAPID keys
            const vapidKeys = WebPushHelper.generateVAPIDKeys();
            res.status(200).json({
                data: {
                    privateVapidKey: vapidKeys.privateKey,
                    publicVapidKey: vapidKeys.publicKey
                }
            });
        }
        catch(e) {

            // Internal Server Error
            res.status(500).json({
                error: e
            });
        }
    }

    // I am a PWA, I want to check whether I am registerd for push notifications, or not.
    static async registrationStatus(req, res) {

        try {

            // Check for required data
            const data = req.query;
            if (!data || !data.publicVapidKey) {

                // Missing required data
                throw 'Missing required data: Please provide a publicVapidKey to query.';
            }

            const publicVapidKey = data.publicVapidKey;

            // Check DB
            let registration = await DatabaseHelper.getRegistrationAsync(publicVapidKey);

            // Success
            res.status(200).json({
                data: {
                    registered: !!registration
                }
            });
        }
        catch(e) {

            // Failure
            res.status(500).json({
                error: e
            });
        }
    }

    // I am a PWA, I wish to enable my users to subscribe for push notifications.
    static async optIn(req, res) {
        
        try {

            // Check for required data
            const data = req.body.data;
            if (!data || !data.privateVapidKey || !data.publicVapidKey || !data.subject) {

                // Missing required data
                throw 'Missing required data: Please provide a data object with registration metadata';
            }

            const privateVapidKey = data.privateVapidKey;
            const publicVapidKey = data.publicVapidKey;
            const subject = data.subject;

            // Create a new PushRegistration object
            const registrationModel = new PushRegistrationModel(privateVapidKey, publicVapidKey, subject)

            // Save to DB
            await DatabaseHelper.createRegistrationAsync(registrationModel);

            // Success
            res.status(200).end();
        }
        catch(e) {

            // Internal Server Error
            res.status(500).json({
                error: e
            });
        }
    }

    // I am a PWA, I no longer wish to send notifications to my users using this push service.
    static async optOut(req, res) {
        
        try {

            // Check for required data
            const data = req.body.data;
            if (!data || !data.publicKey) {

                // Missing required data
                throw 'Missing required data: Please provide a data object with publicKey metadata.';
            }

            const publicKey = data.publicKey;
            
            // Delete from DB
            await DatabaseHelper.deleteRegistrationAsync(publicKey);

            // Success
            res.status(200).end();
        }
        catch(e) {

            // Internal Server Error
            res.status(500).json({
                error: e
            });
        }
    }

    // I am a PWA, I want to send a notification to my subscribed users
    static async push(req, res) {
        
        try {

            // Check for required data
            const data = req.body.data;
            if (!data || !data.publicKey || !data.title || !data.options) {

                // Missing required data
                throw 'Missing required data: Please provide a data object with publicVapidKey, title, and options metadata.';
            }

            // Retrieve the PushRegistration from the DB
            const publicKey = data.publicKey;
            const registrationData = await DatabaseHelper.getRegistrationAsync(publicKey);
            const registration = new PushRegistrationModel(registrationData.privateKey, registrationData.publicKey, registrationData.subject);

            // Create the PushNotification object
            const title = data.title;
            const options = data.options;
            const notification = new PushNotificationModel(JSON.stringify({ title, options }));

            // Queue the push to send the message to any subscribers of this registration.
            WebPushHelper.sendNotification(registration, notification);

            // Success
            res.status(200).end();
        }
        catch(e) {

            // Internal Server Error
            res.status(500).json({
                error: e
            });
        }
    }
}