import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const now = Date.now();

    console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 1 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
    });
}

export async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

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
        // Handle marking the todo as done
        dismissNotification(response.notification.request.identifier);
    } else if (actionIdentifier === 'view') {
        console.log('Todo viewed');
        // Handle viewing the todo
        dismissNotification(response.notification.request.identifier);
    }
});
