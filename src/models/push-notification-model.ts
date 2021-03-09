// A PushNotification represents the payload of a push notification.
// This is the content that will be sent to the push subscriber.
export class PushNotificationModel {

    private _data: string | Buffer;

    constructor(data: string | Buffer) {

        this._data = data;
    }

    public getPayload() {
        
        return this._data instanceof Buffer
            ? this._data
            : JSON.stringify(this._data);
    }
}