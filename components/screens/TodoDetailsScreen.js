import React, {useState, useEffect, useLayoutEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {useSQLiteContext} from 'expo-sqlite';
import {getTodoById, deleteTodo} from '../utils/dbQueries';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {EditTodoModal} from "./modals/EditTodoModal";
import {
    calculateReminderTrigger,
    checkIfTodoExpired,
    getReminderDifference,
    handleUpdateTodo
} from "./functions/functions";
import {scheduleNotification} from "../utils/notifications";

const TodoDetailsScreen = ({route}) => {
    const {id} = route.params;
    const db = useSQLiteContext();
    const [todo, setTodo] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isDatePickerVisibility, setDatePickerVisibility] = useState(false);
    const [reminderHours, setReminderHours] = useState(0);
    const [reminderMinutes, setReminderMinutes] = useState(0);
    const navigation = useNavigation();

    useEffect(() => {
        fetchTodo();
    }, [db, id]);

    const fetchTodo = async () => {
        const result = await getTodoById(db, id);
        const fetchedTodo = result[0];

        const {diffHours, diffMinutes} = getReminderDifference(fetchedTodo);
        setReminderHours(diffHours);
        setReminderMinutes(diffMinutes);

        setTodo(fetchedTodo);
    };

    useLayoutEffect(() => {
        if (!todo) return;

        navigation.setOptions({
            headerStyle: {
                ...styles.headerContainer,
            },
            headerTitleAlign: 'center',
            headerTitle: () => <Text style={styles.headerTitle}>ToDo Details</Text>,
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name={'arrow-left'} size={24} style={styles.headerIcon}/>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={handleMenuClick}>
                        <Feather
                            name={'more-vertical'}
                            size={24}
                            style={styles.headerIcon}
                        />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [todo]);

    const handleMenuClick = () => {
        console.log('menu clicked!');
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    }

    const handleCloseModal = () => {
        setOpenModal(false);
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleInputChange = (name, value) => {
        setTodo({...todo, [name]: value});
    };

    const handleConfirmDate = (date) => {
        setTodo({...todo, toBeComplete: date.getTime()});
        hideDatePicker();
    };

    const handleUpdate = async () => {
        await handleUpdateTodo(todo, reminderHours, reminderMinutes, db, id)
        const reminderTrigger = calculateReminderTrigger(todo.toBeComplete, reminderHours, reminderMinutes);
        if (reminderTrigger.seconds > 0) {
            await scheduleNotification(
                todo.id,
                `Reminder: ${todo.value}`,
                `Your todo "${todo.value}" is due soon.`,
                reminderTrigger);
        }

        setOpenModal(false);
        handleCleanModalData();
        await fetchTodo()
    }

    const handleCleanModalData = () => {
        setTodo({
            value: '',
            description: '',
            created: new Date().getTime(),
            toBeComplete: new Date().getTime(),
            reminder: new Date().getTime(),
            isComplete: false,
        });
        setReminderHours(0);
        setReminderMinutes(0);
    };

    const handleEdit = () => {
        handleOpenModal();
    }

    const handleDelete = async () => {
        Alert.alert(
            'Delete Todo',
            'Are you sure you want to delete this todo?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        await deleteTodo(db, id);
                        navigation.goBack();
                    }
                },
            ]
        );
    };

    if (!todo) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const statusText = checkIfTodoExpired(todo.toBeComplete) ? 'OVERDUE' : 'DUE SOON';
    const statusColor = checkIfTodoExpired(todo.toBeComplete) ? '#D9534F' : '#5A9AA9';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.todoItem}>
                <Text style={styles.isComplete}>{todo.isComplete ? 'Done' : 'Pending'}</Text>
                <Text style={styles.title}>{todo.value}</Text>
                <Text style={styles.description}>{todo.description}</Text>
                <Text style={styles.date}>
                    <Feather name="calendar" size={16}/> To be completed
                    by: {new Date(todo.toBeComplete).toLocaleString()}
                </Text>
                <Text style={styles.date}>
                    <Feather name="clock" size={16}/> Created on: {new Date(todo.created).toLocaleString()}
                </Text>
                <Text style={[styles.status, {color: statusColor}]}>
                    <Feather name="check-circle" size={16}/> Status: {statusText}
                </Text>
                {todo.reminder && (
                    <Text style={styles.date}>
                        <Feather name="bell" size={16}/> Reminder set for: {new Date(todo.reminder).toLocaleString()}
                    </Text>
                )}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Feather name="edit" size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Feather name="trash-2" size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <EditTodoModal
                openModal={openModal}
                actionType={'update'}
                todoData={todo}
                handleInputChange={handleInputChange}
                showDatePicker={showDatePicker}
                isDatePickerVisible={isDatePickerVisibility}
                handleConfirmDate={handleConfirmDate}
                hideDatePicker={hideDatePicker}
                reminderHours={reminderHours}
                reminderMinutes={reminderMinutes}
                setReminderHours={setReminderHours}
                setReminderMinutes={setReminderMinutes}
                handleUpdate={handleUpdate}
                handleCloseModal={handleCloseModal}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#879fa6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#fff',
    },
    headerIcon: {
        color: '#5A9AA9',
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '300',
        color: '#5A9AA9',
        marginVertical: 5,
        textAlign: 'center',
        padding: 3,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    todoItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    date: {
        fontSize: 14,
        color: 'gray',
        marginVertical: 5,
        textAlign: 'center',
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    isComplete: {
        textAlign: 'right',
        color: 'rgb(133,156,162)',
        fontWeight: '300',
    },
    editButton: {
        backgroundColor: '#5A9AA9',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#D9534F',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        marginLeft: 5,
    },
});

export default TodoDetailsScreen;
