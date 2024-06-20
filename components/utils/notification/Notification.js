import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const SendPushNotification = async (title, message, triggerDate) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: message,
      data: { data: 'todo reminder' },
      sound: 'default',
      badge: 1, 
    },
    trigger: {
      date: triggerDate,
    },
  });
};

export const scheduleTodosNotifications = async (db) => {
  const todos = await db.allAsync('SELECT * FROM todos WHERE isComplete = 0');

  todos.forEach(todo => {
    if (todo.reminder) {
      const reminderDate = new Date(todo.reminder);
      if (reminderDate > new Date()) {
        SendPushNotification(todo.value, todo.description, reminderDate);
      }
    }
  });
};
