import {addTodo, getAllTodos, getTodoById, updateTodo} from "../../utils/dbQueries";
import moment from "moment";
import {Alert} from "react-native";

export const handleCompleteTodo = async (id, db, todos) => {
    const [todo] = todos.filter((item) => item.id === id);
    const updatedTodo = {...todo, isComplete: !todo.isComplete};
    await updateTodo(
        db,
        id,
        updatedTodo.value,
        updatedTodo.description,
        updatedTodo.isComplete,
        updatedTodo.toBeComplete,
        updatedTodo.reminder
    );
};

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
                onPress: () => Alert.alert('Cancel Pressed'),
                style: 'cancel',
            },
        ],
        {
            cancelable: true,
            onDismiss: () =>
                Alert.alert(
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
        value: todo.value,
        description: todo.description,
        created: todo.created,
        toBeComplete: todo.toBeComplete,
        reminder: todo.reminder,
        isComplete: todo.isComplete,
    });

    const reminderDate = moment(todo.toBeComplete).subtract(todo.toBeComplete - todo.reminder);
    setReminderHours(moment(todo.toBeComplete).diff(reminderDate, 'hours'));
    setReminderMinutes(moment(todo.toBeComplete).diff(reminderDate, 'minutes'));
};