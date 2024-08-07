import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import {scheduleNotification} from './notifications';
import {calculateReminderHrsAndMin, calculateReminderTrigger, fetchAllTodos} from '../screens/functions/functions';
import {BackgroundFetchResult} from 'expo-background-fetch';
import {Alert} from "react-native";

const TASK_NAME = 'BACKGROUND_NOTIFICATIONS_TASK';

TaskManager.defineTask(TASK_NAME, async ({data, error}) => {
    if (error) {
        console.error(error);
        return BackgroundFetchResult.Failed;
    }

    if (data) {
        const {taskName} = data;
        if (taskName === TASK_NAME) {
            console.log('Handling notifications in background task');

            const todos = await fetchAllTodos();
            todos.forEach(todo => {
                if (todo.reminder && !todo.isComplete) {
                    const {reminderHrs, reminderMins} = calculateReminderHrsAndMin(todo.toBeComplete, todo.reminder);
                    const reminderTrigger = calculateReminderTrigger(todo.toBeComplete, reminderHrs, reminderMins);

                    if (reminderTrigger.seconds > 0) {
                        scheduleNotification(
                            `Reminder: ${todo.value}`,
                            `Your todo "${todo.value}" is due soon.`,
                            reminderTrigger
                        );
                    }
                }
            });
            return BackgroundFetchResult.NewData;
        }
    }

    return BackgroundFetchResult.NoData;
});

export const registerBackgroundTask = async () => {
    try {
        const registeredTasks = await TaskManager.getRegisteredTasksAsync();

        const isTaskRegistered = registeredTasks.some(task => task.taskName === TASK_NAME);

        if (isTaskRegistered) {
            await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
        }

        await BackgroundFetch.registerTaskAsync(TASK_NAME, {
            minimumInterval: 30,
            stopOnTerminate: false,
            startOnBoot: true,
        });
    } catch (error) {
        Alert.alert('Background Task',"Failed to register background task.");
    }
};