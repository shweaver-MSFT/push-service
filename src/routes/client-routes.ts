import { DatabaseHelper } from "../helpers/database-helper";
import { PushSubscriptionModel } from "../models/push-subscription-model";

//
export class ClientRoutes {

    // I am a user, I want to check whether I am subscribed for push notifications, or not.
    public static async subscriptionStatus(req, res) {

        try {

            // Check for required data
            const data = req.body.data;
            if (!data || !data.publicVapidKey || !data.endpoint) {

                throw 'Missing required data: Please provide a data object with a publicVapidKey and subscription endpoint for query.';
            }

            const publicVapidKey = data.publicVapidKey;
            const endpoint = data.endpoint;

            // Check DB
            let subscription = await DatabaseHelper.getSubscriptionAsync(publicVapidKey, endpoint);

            // Success
            res.status(200).json({
                data: {
                    subscribed: !!subscription
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

    // I am a user, I want to subscribe my client for push notifications.
    public static async subscribe(req, res) {

        try {

            // Check for required data
            const data = req.body.data;
            if (!data || !data.publicVapidKey || !data.subscription) {

                throw 'Missing required data: Please provide a data object with a publicVapidKey and subscription metadata.';
            }

            const publicVapidKey = data.publicVapidKey;
            const subscription = data.subscription;

            const subscriptionModel = new PushSubscriptionModel(subscription);

            await DatabaseHelper.createSubscriptionAsync(publicVapidKey, subscriptionModel);
            
            // Success
            res.status(200).end();
        }
        catch(e) {

            // Failure
            res.status(500).json({
                error: e
            });
        }
    }

    // I am a user, I no longer wish to receive push notifications to my client.
    public static async unsubscribe(req, res) {

        try {

            // Check for required data
            const data = req.body.data;
            if (!data || !data.publicVapidKey || !data.endpoint) {

                throw 'Missing required data: Please provide a data object with a publicVapidKey and subscription endpoint.';
            }

            const publicVapidKey = data.publicVapidKey;
            const endpoint = data.endpoint;

            // Delete from DB
            await DatabaseHelper.deleteSubscriptionAsync(publicVapidKey, endpoint);

            // Success
            res.status(200).end();
        }
        catch(e) {

            // Failure
            res.status(500).json({
                error: e
            });
        }
    }
}