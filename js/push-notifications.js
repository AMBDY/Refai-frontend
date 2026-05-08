// Push notifications
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

function sendNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}
