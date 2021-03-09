// Public VAPID Key
const publicVapidKey = '<YOUR-PUBLIC-VAPID-KEY-HERE>';

// Respond to activation
self.addEventListener('activate', async () => {
    
    try {

        const applicationServerKey = urlB64ToUint8Array(publicVapidKey);
        const options = { 
            applicationServerKey, 
            userVisibleOnly: true 
        };
        const subscription = await self.registration.pushManager.subscribe(options);
        
        const response = await saveSubscription(subscription);
    } 
    catch (e) {

        console.log(e.message);
    }
});

// Respond to a push event
self.addEventListener('push', async function(event) {

    if (event.data) {
        
        const data = JSON.parse(event.data.json());

        if (!data.title || !data.options) {

            return;
        }

        const title = data.title;
        const options = data.options;

        await self.registration.showNotification(title, options);
    } 
    else {

        console.log('Push event but no data')
    }
});

// saveSubscription saves the subscription to the backend
async function saveSubscription(subscription) {

    subscription = subscription || await getSubscriptionAsync();

    const url = '/?action=subscribe'
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: {
                publicVapidKey: publicVapidKey,
                subscription: subscription
            }
        })
    });

    return response.json()
}

// get the subscription object
async function getSubscriptionAsync() {

    return await self.registration.pushManager.getSubscription();
}

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
function urlB64ToUint8Array(base64String) {

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {

        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}