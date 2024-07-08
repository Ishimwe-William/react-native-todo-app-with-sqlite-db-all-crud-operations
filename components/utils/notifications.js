import * as Notifications from 'expo-notifications';
import { navigationRef } from './navigationRef';
import { handleCompleteTodo } from '../screens/functions/functions';

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

export const scheduleNotification = async (id, title, body, trigger) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { id },
            categoryIdentifier: 'todoActions',
        },
        trigger: trigger,
    });
};

export const dismissNotification = async (identifier) => {
    await Notifications.dismissNotificationAsync(identifier);
};

export const setupNotificationListener = (db) => {
    Notifications.addNotificationResponseReceivedListener(async response => {
        const actionIdentifier = response.actionIdentifier;
        const id = response.notification.request.content.data.id;

        if (actionIdentifier === 'markAsDone') {
            await handleCompleteTodo(id, db);
            await dismissNotification(response.notification.request.identifier);
            if (navigationRef.current) {
                navigationRef.current.navigate('Home', { refresh: true });
            }
        } else if (actionIdentifier === 'view') {
            if (navigationRef.current) {
                navigationRef.current.navigate('TodoDetails', { id });
            }
            await dismissNotification(response.notification.request.identifier);
        }
    });
};
