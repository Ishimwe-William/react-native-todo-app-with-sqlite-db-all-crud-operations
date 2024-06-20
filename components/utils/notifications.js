import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('You need to grant permissions to use notifications.');
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    await Notifications.setNotificationCategoryAsync('todoActions', [
        {
            identifier: 'markAsDone',
            buttonTitle: 'Mark as Done',
            options: {
                opensAppToForeground: true,
            },
        },
        {
            identifier: 'view',
            buttonTitle: 'View',
            options: {
                opensAppToForeground: true,
            },
        },
    ]);
};

export const scheduleNotification = async (title, body, trigger) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            categoryIdentifier: 'todoActions',
        },
        trigger,
    });
};

export const dismissNotification = async (identifier) => {
    await Notifications.dismissNotificationAsync(identifier);
};

Notifications.addNotificationResponseReceivedListener(response => {
    const actionIdentifier = response.actionIdentifier;

    if (actionIdentifier === 'markAsDone') {
        console.log('Todo marked as done');
       // ToDo: handle complete todo
        dismissNotification(response.notification.request.identifier);
    } else if (actionIdentifier === 'view') {
        // ToDo: handle view todo
        console.log('Todo snoozed');
        dismissNotification(response.notification.request.identifier);
    }
});
