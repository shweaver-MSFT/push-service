// A PushRegistration represents a PWA domain that wishes to utilize the
// push notification service for its own users.
//
// This model includes secure details needed to send notifications to PWA users
// on behalf of the PWA domain.
export class PushRegistrationModel {

    privateKey: string; // < URL Safe Base64 Encoded Private Key >
    publicKey: string; // < URL Safe Base64 Encoded Public Key >
    subject: string // < \'mailto\' Address or URL >

    constructor(privateKey: string, publicKey: string, subject: string) {

        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.subject = subject;
    }
}