import {addTodo, completeTodo, getAllTodos, getTodoById, updateTodo} from "../../utils/db/dbQueries";
import moment from "moment";
import {Alert} from "react-native";

export const handleCompleteTodo = async (id, db) => {
    await completeTodo(db, id);
}

export const handleUpdateTodo = async (todoData, reminderHours, reminderMinutes, db, todoId) => {
    const toBeCompleteDate = new Date(todoData.toBeComplete);
    const reminderDate = new Date(toBeCompleteDate);

    reminderDate.setHours(toBeCompleteDate.getHours() - reminderHours);
    reminderDate.setMinutes(toBeCompleteDate.getMinutes() - reminderMinutes);

    await updateTodo(
        db,
        todoId,
        todoData.value,
        todoData.description,
        todoData.isComplete,
        todoData.toBeComplete,
        reminderDate.getTime()
    );
}

export const handleCreateTodo = async (todoData, reminderHours, reminderMinutes, db) => {
    const toBeCompleteDate = new Date(todoData.toBeComplete);
    const reminderDate = new Date(toBeCompleteDate);

    reminderDate.setHours(toBeCompleteDate.getHours() - reminderHours);
    reminderDate.setMinutes(toBeCompleteDate.getMinutes() - reminderMinutes);

    await addTodo(
        db,
        todoData.value,
        todoData.description,
        todoData.created,
        todoData.isComplete,
        todoData.toBeComplete,
        reminderDate.getTime()
    );
};

export const fetchAllTodos = async (db, setTodos, checkIfHasTodosForToday) => {
    const result = await getAllTodos(db);
    setTodos(result);
    checkIfHasTodosForToday(result);
};

export const checkIfTodoExpired = (timeToExpire) => {
    const currentTime = moment();
    const expireTime = moment(timeToExpire);

    if (currentTime.isAfter(expireTime)) {
        return true;
    }

    if (currentTime.isSame(expireTime)) {
        const currentSeconds = currentTime.seconds();
        const expireSeconds = expireTime.seconds();

        if (currentSeconds > expireSeconds) {
            return true;
        }
    }

    return false;
};

export const showAlert = (title, message) =>
    Alert.alert(
        title,
        message,
        [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
        ],
        {
            cancelable: true,
            onDismiss: () =>
                console.log(
                    'This alert was dismissed by tapping outside of the alert dialog.'
                ),
        }
    );

export const handleRescheduleTodo = async (id, db, setOpenModal, setActionType, setTodoId, setTodoData, setReminderHours, setReminderMinutes) => {
    const result = await getTodoById(db, id);
    const todo = result[0];

    setOpenModal(true);
    setActionType('update')
    setTodoId(id)

    setTodoData({
        id: todo.id,
        value: todo.value,
        description: todo.description,
        created: todo.created,
        toBeComplete: todo.toBeComplete,
        reminder: todo.reminder,
        isComplete: todo.isComplete,
    });

    const {diffHours, diffMinutes} = getReminderDifference(todo);
    setReminderHours(diffHours);
    setReminderMinutes(diffMinutes);
};

export const getReminderDifference = (todo) => {
    const toBeCompleteDate = moment(todo.toBeComplete);
    const reminderDate = moment(todo.reminder);
    const diffMilliseconds = toBeCompleteDate.diff(reminderDate);

    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    return {diffHours, diffMinutes};
}

export const calculateReminderTrigger = (toBeComplete, reminderHours, reminderMinutes) => {
    const reminderTime = moment(toBeComplete)
        .subtract(reminderHours, 'hours')
        .subtract(reminderMinutes, 'minutes');

    const triggerInSeconds = moment.duration(reminderTime.diff(moment())).asSeconds();
    return {seconds: triggerInSeconds};
};


export const calculateReminderHrsAndMin = (toBeComplete, reminder) => {
    const diffMillis = reminder - toBeComplete;
    const diffMinutes = Math.floor((diffMillis / (1000 * 60)) % 60);
    const diffHours = Math.floor((diffMillis / (1000 * 60 * 60)) % 24);
    return {
        reminderHrs: diffHours,
        reminderMins: diffMinutes
    };
};

export const handleRateClick = () => {
    showAlert('Rate us', 'This feature not yet implemented');
};

export const handleMenuClick = () => {
    showAlert('Menu', 'This feature not yet implemented');
    console.log('open menu');
};