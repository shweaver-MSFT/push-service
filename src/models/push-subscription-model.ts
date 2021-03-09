export interface IPushSubscriptionKeys {
    
    p256dh: string,
    auth: string
}

// A PushSubscription represents the push identity/endpoint of a single browser client.
export class PushSubscriptionModel {

    endpoint: string;
    keys: IPushSubscriptionKeys;

    constructor(data: any) {

        this.endpoint = data.endpoint;
        this.keys = data.keys;
    }
}