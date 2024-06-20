import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { scheduleNotification } from './notifications';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

export const registerBackgroundFetch = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
        return;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
    });

    await BackgroundFetch.setMinimumIntervalAsync(15 * 60);
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        await scheduleNotification("Reminder", "This is your scheduled notification.", { seconds: 1 });
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});
