import { PushSubscriptionModel } from "../models/push-subscription-model";
import { PushRegistrationModel } from "../models/push-registration-model";

const { CosmosClient } = require("@azure/cosmos");

const registrationsDatabaseRequest = {
    id: 'PushRegistrationsDatabase'
};
const registrationsContainerRequest = {
    id: 'PushRegistrationsContainer'
}
const subscriptionsDatabaseRequest = {
    id: 'PushNotificationSubscriptions'
}

//
export class DatabaseHelper {

    private static _clientOptions;

    //
    public static config(endpoint, key) {
        
        this._clientOptions = {
            key: key,
            endpoint: endpoint
        };
    }

    //
    public static async getRegistrationAsync(publicKey: string) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);
        const { database } = await client.databases.createIfNotExists(registrationsDatabaseRequest);
        const { container } = await database.containers.createIfNotExists(registrationsContainerRequest);
        const { resources: results } = await container.items.query({
            query: 'SELECT * FROM c WHERE c.publicKey = @publicKey',
            parameters: [{
                name: '@publicKey',
                value: publicKey
            }]
        }).fetchAll();

        return results[0] || null;
    }

    //
    public static async createRegistrationAsync(registration: PushRegistrationModel) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);
        const { database }  = await client.databases.createIfNotExists(registrationsDatabaseRequest);
        const { container } = await database.containers.createIfNotExists(registrationsContainerRequest);
        const { item } = await container.items.create(registration);

        // Create container for storing subscriptions associated with this registration.
        await this.createSubscriptionsContainerAsync(registration);

        return item;
    }

    //
    public static async deleteRegistrationAsync(publicKey: string) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);
        const { database } = await client.database(registrationsDatabaseRequest);
        if (!database) {

            throw '';
        }

        const { container } = await database.container(registrationsContainerRequest);
        if (!container) {

            throw '';
        }

        const { resources: results } = await container.items.query({
            query: 'SELECT * FROM c WHERE c.publicKey = @publicKey',
            parameters: [{
                name: '@publicKey',
                value: publicKey
            }]
        }).fetchAll();

        const item = results[0] || null;

        if (item) {
            
            // Delete the associated Subscriptions container.
            await this.deleteSubscriptionsContainerAsync(publicKey)

            await container.item(item.id, publicKey).delete();
        }
    }

    //
    public static async createSubscriptionsContainerAsync(registration: PushRegistrationModel) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);
        const { database } = await client.databases.createIfNotExists(subscriptionsDatabaseRequest);
        const { container } = await database.containers.createIfNotExists({
            id: registration.publicKey
        });

        return container;
    }

    //
    public static async deleteSubscriptionsContainerAsync(publicKey: string) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);

        const { database } = await client.database(subscriptionsDatabaseRequest);
        if (database) {
        
            const { container } = database.container({ id: publicKey });
            if (container) {

                await container.delete();
            }
        }
    }

    //
    public static async getSubscriptionAsync(publicKey: string, subscriptionEndpoint: string) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);

        const { database }  = await client.database(subscriptionsDatabaseRequest);
        if (!database) {

            return;
        }

        const { container } = await database.container({ id: publicKey });
        if (!container) {

            return;
        }

        const { resources: results } = await container.items.query({
            query: 'SELECT * FROM c WHERE c.endpoint = @endpoint',
            parameters: [{
                name: '@endpoint',
                value: subscriptionEndpoint
            }]
        }).fetchAll();

        return results[0] || null;
    }

    //
    public static async getSubscriptionsAsync(publicKey: string) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);

        const { database }  = await client.database(subscriptionsDatabaseRequest);
        if (!database) {

            throw '';
        }

        const { container } = await database.container({ id: publicKey });
        if (!container) {

            throw 'Subscription container not found';
        }

        const readItems = await container.items.readAll();
        const fetchItems = await readItems.fetchAll();

        return fetchItems.resources;
    }

    //
    public static async createSubscriptionAsync(publicKey: string, subscription: PushSubscriptionModel) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);
        const { database }  = await client.databases.createIfNotExists(subscriptionsDatabaseRequest);
        const { container } = await database.containers.createIfNotExists({ id: publicKey });
        const { item } = await container.items.create(subscription);

        return item;
    }

    //
    public static async deleteSubscriptionAsync(publicKey: string, subscriptionEndpoint: string) {

        const client = new CosmosClient(DatabaseHelper._clientOptions);
        const { database }  = await client.databases.createIfNotExists(subscriptionsDatabaseRequest);
        const { container } = await database.containers.createIfNotExists({ id: publicKey });

        const { resources: results } = await container.items.query({
            query: 'SELECT * FROM c WHERE c.endpoint = @endpoint',
            parameters: [{
                name: '@endpoint',
                value: subscriptionEndpoint
            }]
        }).fetchAll();

        const item = results[0];

        await container.item(item.id, subscriptionEndpoint).delete();
    }
}