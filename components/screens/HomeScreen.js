import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {
    View,
    Alert,
    StyleSheet,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    TextInput,
    Animated,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
    addTodo,
    getAllTodos,
    updateTodo,
    deleteTodo, getTodoById,
} from '../utils/dbQueries';
import {useSQLiteContext} from 'expo-sqlite';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import Collapsible from 'react-native-collapsible';

const hourOptions = Array.from({length: 24}, (_, i) => i);
const minuteOptions = Array.from({length: 60}, (_, i) => i);

const HomeScreen = () => {
    const db = useSQLiteContext();
    const isFocused = useIsFocused();
    const [todos, setTodos] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTodos, setSelectedTodos] = useState([]);
    const [isLongPressed, setIsLongPressed] = useState(false);
    const [reminderHours, setReminderHours] = useState(0);
    const [reminderMinutes, setReminderMinutes] = useState(0);
    const [todoData, setTodoData] = useState({
        value: '',
        description: '',
        created: new Date().getTime(),
        toBeComplete: new Date().getTime(),
        reminder: new Date().getTime(),
        isComplete: false,
    });
    const [activeSections, setActiveSections] = useState([]);
    const flatListRef = useRef(null);
    const [hasScrolledAwayFromToday, setHasScrolledAwayFromToday] =
        useState(false);
    const [opacityValue] = useState(new Animated.Value(0));
    const [actionOpacityValue] = useState(new Animated.Value(0));
    const [hasTodosForToday, setHasTodosForToday] = useState(false);
    const [actionType, setActionType] = useState('create')
    const [todoId, setTodoId] = useState(null)
    const navigation = useNavigation();

    useEffect(() => {
        if (isFocused) {
            fetchTodos();
        }
    }, [db, isFocused]);

    useEffect(() => {
        if (selectedTodos.length === 0) {
            setIsLongPressed(false);
            animateActionOpacity(0);
        }
    }, [selectedTodos]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                ...styles.headerContainer,
            },
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.title}>All ToDos</Text>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Feather name={'menu'} size={24} style={styles.headerIcon}/>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={handleRateClick}>
                        <MaterialCommunityIcons
                            name={'star-half-full'}
                            size={24}
                            style={styles.headerIcon}
                        />
                    </TouchableOpacity>

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
    }, [selectedTodos, isFocused]);

    const fetchTodos = async () => {
        setIsLoading(true);
        const result = await getAllTodos(db);
        setTodos(result);
        checkIfHasTodosForToday(result);
        setIsLoading(false);
    };

    const checkIfHasTodosForToday = (todos) => {
        const today = moment().format('YYYY-MM-DD');
        const hasTodos = todos.some(todo => moment(todo.toBeComplete).format('YYYY-MM-DD') === today);
        setHasTodosForToday(hasTodos);
    };

    const handleInputChange = (name, value) => {
        setTodoData({...todoData, [name]: value});
    };

    const animateOpacity = (toValue) => {
        Animated.timing(opacityValue, {
            toValue,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const animateActionOpacity = (toValue) => {
        Animated.timing(actionOpacityValue, {
            toValue,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const showAlert = (title, message) =>
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

    const handleRateClick = () => {
        showAlert('Rate us', 'This feature not yet implemented');
    };

    const handleMenuClick = () => {
        showAlert('Menu', 'This feature not yet implemented');
        console.log('open menu');
    };

    const handleCreate = async () => {
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

        setOpenModal(false);
        handleCleanModalData();
        await fetchTodos();
    };

    const handleUpdate = async () => {
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

        setOpenModal(false);
        handleCleanModalData();
        await fetchTodos();
    }

    const completeTodo = async (id) => {
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
        await fetchTodos();
    };

    const handleReschedule = async (id) => {
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

    const handleView = (id) => {
        navigation.navigate('TodoDetails', {id});
    };

    const handleDelete = async () => {
        for (id of selectedTodos) {
            await deleteTodo(db, id);
        }
        await fetchTodos();
        handleClearSelect();
    };

    const handleClearSelect = () => {
        setSelectedTodos([]);
        setIsLongPressed(false);
    };

    const handleCleanModalData = () => {
        setTodoData({
            value: '',
            description: '',
            created: new Date().getTime(),
            toBeComplete: new Date().getTime(),
            reminder: new Date().getTime(),
            isComplete: false,
        });
        setReminderHours(0);
        setReminderMinutes(0);
        setActionType('create')
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };


    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        handleCleanModalData()
    };

    const handleConfirmDate = (date) => {
        setTodoData({...todoData, toBeComplete: date.getTime()});
        hideDatePicker();
    };

    const groupTodosByDate = (todos) => {
        return todos.reduce((groups, todo) => {
            const date = moment(todo.toBeComplete).format('YYYY-MM-DD');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(todo);
            return groups;
        }, {});
    };

    const toggleExpand = (id) => {
        setActiveSections((prev) => {
            if (prev.includes(id)) {
                return prev.filter((sectionId) => sectionId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const addToAction = (id) => {
        setIsLongPressed(true);
        animateActionOpacity(1);
        const index = selectedTodos.indexOf(id);
        if (index !== -1) {
            setSelectedTodos((prevSelected) =>
                prevSelected.filter((todoId) => todoId !== id)
            );
        } else {
            setSelectedTodos((prevSelected) => [...prevSelected, id]);
        }
    };

    const checkIfExpired = (timeToExpire) => {
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

    const getTodayIndex = () => {
        const today = moment().format('YYYY-MM-DD');
        return sortedDates.findIndex((date) => date === today);
    };

    const scrollToToday = () => {
        const todayIndex = getTodayIndex();
        if (todayIndex !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({index: todayIndex, animated: true});
            setHasScrolledAwayFromToday(false);
        }
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const viewableItemsChanged = useRef(({viewableItems}) => {
        const today = moment().format('YYYY-MM-DD');
        const isViewingToday = viewableItems.some(
            (viewableItem) => viewableItem.item === today
        );
        setHasScrolledAwayFromToday(!isViewingToday);
    });

    useEffect(() => {
        animateOpacity(hasScrolledAwayFromToday && hasTodosForToday ? 1 : 0);
    }, [hasScrolledAwayFromToday, hasTodosForToday]);

    const groupedTodos = groupTodosByDate(todos);
    const sortedDates = Object.keys(groupedTodos).sort();

    return (
        <>
            {!isLoading ? (
                <View style={styles.container}>
                    <FlatList
                        ref={flatListRef}
                        data={sortedDates}
                        keyExtractor={(item) => item}
                        viewabilityConfig={viewabilityConfig}
                        onViewableItemsChanged={viewableItemsChanged.current}
                        renderItem={({item}) => (
                            <View style={styles.grp}>
                                <View style={styles.groupTitle}>
                                    <Text style={styles.dateText}>
                                        {moment(item).format('ddd')}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {moment(item).format('MMM')}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {moment(item).format('DD')}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {moment(item).format('YYYY')}
                                    </Text>
                                </View>
                                <View style={styles.todoGroup}>
                                    {groupedTodos[item].map((todo) => (
                                        <View
                                            style={[
                                                styles.todoItem,
                                                {
                                                    backgroundColor: todo.isComplete
                                                        ? 'rgba(255,255,255,0.63)'
                                                        : '#fff',
                                                },
                                                selectedTodos.includes(todo.id) &&
                                                styles.selectedTodoItem,
                                            ]}
                                            key={todo.id}>
                                            <TouchableOpacity
                                                onPress={
                                                    !isLongPressed
                                                        ? () => toggleExpand(todo.id)
                                                        : () => addToAction(todo.id)
                                                }
                                                onLongPress={() => addToAction(todo.id)}>
                                                <View style={styles.grp}>
                                                    <Text
                                                        style={
                                                            todo.isComplete
                                                                ? styles.todoTitleComplete
                                                                : styles.todoTitle
                                                        }
                                                        numberOfLines={
                                                            !activeSections.includes(todo.id) ? 1 : null
                                                        }
                                                        ellipsizeMode="tail">{`${todo.value}`}</Text>
                                                    <Text
                                                        style={[
                                                            styles.todoStatus,
                                                            !todo.isComplete
                                                                ? checkIfExpired(todo.toBeComplete)
                                                                    ? styles.statusPending
                                                                    : styles.statusAhead
                                                                : styles.statusComplete,
                                                        ]}>
                                                        {`${
                                                            !todo.isComplete
                                                                ? checkIfExpired(todo.toBeComplete)
                                                                    ? 'pending'
                                                                    : `${moment(todo.toBeComplete).format(
                                                                        'ddd H:mm'
                                                                    )}`
                                                                : 'completed'
                                                        }`}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <Collapsible
                                                collapsed={!activeSections.includes(todo.id)}>
                                                <Text style={styles.todoDescription}>
                                                    {`${todo.description}`}
                                                </Text>
                                                {!todo.isComplete && (
                                                    <View>
                                                        <View
                                                            style={[styles.grp, {alignItems: 'center'}]}>
                                                            <Text style={styles.todoStatus}>
                                                                Due:{' '}
                                                                {`${moment(todo.toBeComplete).format(
                                                                    'MMM DD, H:mm'
                                                                )}`}
                                                            </Text>
                                                            <Text style={styles.todoStatus}>
                                                                {
                                                                    <Feather
                                                                        name="bell"
                                                                        size={24}
                                                                        color={'red'}
                                                                    />
                                                                }
                                                                {'  '}
                                                                {`${moment(todo.reminder).format(
                                                                    'MMM DD, H:mm'
                                                                )}`}
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={[styles.grp, {marginVertical: 5}]}>
                                                            <View style={styles.viewBtn}>
                                                                <TouchableOpacity
                                                                    onPress={() => handleView(todo.id)}>
                                                                    <Text style={{color: '#5A9AA9'}}>View</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <View style={styles.rescheduleBtn}>
                                                                <TouchableOpacity
                                                                    onPress={() => handleReschedule(todo.id)}>
                                                                    <Text style={{color: '#5A9AA9'}}>{<Feather
                                                                        name={'clock'} size={16}
                                                                        color={'#5A9AA9'}/>}{' '}Reschedule</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )}
                                                <View style={styles.grp}>
                                                    <TouchableOpacity
                                                        onPress={() => completeTodo(todo.id)}>
                                                        <Text style={styles.completeBtn}>
                                                            {todo.isComplete ? 'Unmark' : 'Mark'} as complete
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.todoCreated}>
                                                        Created:{' '}
                                                        {`${moment(todo.created).format('MMM DD H:mm')}`}
                                                    </Text>
                                                </View>
                                            </Collapsible>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        contentContainerStyle={styles.scrollViewContent}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
                        <Feather name="plus" size={30} color="white"/>
                    </TouchableOpacity>

                    <Animated.View
                        style={[styles.scrollToTodayButton, {opacity: opacityValue}]}>
                        <TouchableOpacity
                            onPress={hasScrolledAwayFromToday ? scrollToToday : () => {
                            }}>
                            <Feather name="calendar" size={30} color="white"/>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: actionOpacityValue,
                            backgroundColor: 'transparent',
                        }}>
                        <View style={styles.actionGrp}>
                            <TouchableOpacity onPress={() => handleDelete()}>
                                <View
                                    style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Text style={{color: 'white',}}>{' '}Delete selected</Text>
                                    <MaterialCommunityIcons
                                        name="delete-forever"
                                        size={40}
                                        color="red"
                                    />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleClearSelect}>
                                <Text>{<MaterialCommunityIcons
                                    name="close-circle-outline"
                                    size={40}
                                    color="#fff"
                                />}{' '}Unselect all</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                    <Modal visible={openModal} animationType="slide">
                        <ScrollView contentContainerStyle={{flexGrow: 1}}>
                            <View style={styles.modalContent}>
                                <Text style={[styles.title, {backgroundColor: 'white'}]}>
                                    Create ToDo
                                </Text>
                                <TextInput
                                    style={[styles.modalInput, {marginTop: 20}]}
                                    placeholder="Title"
                                    value={todoData.value}
                                    onChangeText={(text) => handleInputChange('value', text)}
                                />
                                <TextInput
                                    style={[styles.modalInput, styles.modalTextarea]}
                                    placeholder="Description"
                                    multiline={true}
                                    numberOfLines={4}
                                    value={todoData.description}
                                    onChangeText={(text) =>
                                        handleInputChange('description', text)
                                    }
                                />
                                <TouchableOpacity onPress={showDatePicker}>
                                    <Text style={styles.modalInput}>
                                        Due: {moment(todoData.toBeComplete).format('lll')}
                                    </Text>
                                </TouchableOpacity>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisible}
                                    mode="datetime"
                                    onConfirm={handleConfirmDate}
                                    onCancel={hideDatePicker}
                                />
                                <Text style={styles.notificationTitle}>
                                    {<Feather name="bell" size={20}/>} Add notification time [{' '}
                                    {reminderHours} hrs {reminderMinutes} min before due ]
                                </Text>
                                <View style={styles.modalPickerGrp}>
                                    <View style={styles.modalPicker}>
                                        <Picker
                                            selectedValue={reminderHours}
                                            onValueChange={(value) => setReminderHours(value)}>
                                            {hourOptions.map((hour) => (
                                                <Picker.Item
                                                    label={`${hour} hr`}
                                                    value={hour}
                                                    key={hour}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                    <View style={styles.modalPicker}>
                                        <Picker
                                            selectedValue={reminderMinutes}
                                            onValueChange={(value) => setReminderMinutes(value)}>
                                            {minuteOptions.map((minute) => (
                                                <Picker.Item
                                                    label={`${minute} min`}
                                                    value={minute}
                                                    key={minute}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={handleCloseModal}>
                                        <Text style={styles.modalButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.createButton]}
                                        onPress={actionType === 'update' ? handleUpdate : handleCreate}>
                                        <Text
                                            style={styles.modalButtonText}>{actionType === 'update' ? 'Update' : 'Create'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                </View>
            ) : (
                <View style={[styles.container, styles.loading]}>
                    <ActivityIndicator size="large" color="#fff"/>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#5A9AA9',
    },
    headerContainer: {
        backgroundColor: '#fff',
    },
    headerIcon: {
        color: '#5A9AA9',
        paddingHorizontal: 15,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        backgroundColor: '#4682b4',
        elevation: 5,
        borderRadius: 50,
        padding: 15,
    },
    scrollToTodayButton: {
        position: 'absolute',
        right: 30,
        bottom: 100,
        backgroundColor: '#4682b4',
        elevation: 5,
        borderRadius: 50,
        padding: 15,
    },

    todoItem: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        width: '90%',
        marginRight: 10,
        marginLeft: 5,
    },
    selectedTodoItem: {
        backgroundColor: '#FF6464',
    },
    loading: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    todoGroup: {
        marginBottom: 20,
        width: '90%',
        alignSelf: 'center',
    },
    grp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    groupTitle: {
        fontWeight: 'bold',
        width: '12%',
        padding: 3,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#ddd',
        marginBottom: 25,
        marginTop: 3,
        marginLeft: 3,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusPending: {
        textAlign: 'right',
        color: 'orange',
    },
    statusAhead: {
        textAlign: 'right',
        color: 'green',
    },
    statusComplete: {
        textAlign: 'right',
        color: 'gray',
    },
    title: {
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
    todoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        width: '80%',
    },
    todoTitleComplete: {
        textDecorationLine: 'line-through',
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        width: '80%',
    },
    todoDescription: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    todoCreated: {
        fontSize: 12,
        color: '#999',
        marginVertical: 5,
        textAlign: 'right',
    },
    todoStatus: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    completeBtn: {
        fontSize: 12,
        color: 'green',
        marginVertical: 5,
        textAlign: 'right',
    },
    actionGrp: {
        flexDirection: 'row',
    },

    modalContent: {
        flex: 1,
        padding: 20,
        backgroundColor: '#5A9AA9',
    },

    modalInput: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#dcdcdc',
        backgroundColor: 'white',
        borderRadius: 5,
        marginBottom: 10,
    },
    modalPicker: {
        height: 40,
        justifyContent: 'center',
        width: '45%',
        borderWidth: 1,
        borderColor: '#dcdcdc',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    modalTextarea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#B4B4B4FF',
        marginRight: 10,
        elevation: 5,
    },
    createButton: {
        backgroundColor: '#4682b4',
        elevation: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalPickerGrp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    notificationTitle: {
        color: 'white',
        fontWeight: '100',
    },
    viewBtn: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#5A9AA9',
        padding: 5,
        width: '45%',
        alignItems: 'center'
    },
    rescheduleBtn: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#5A9AA9',
        padding: 5,
        width: '45%',
        alignItems: 'center'
    },
});

export default HomeScreen;
