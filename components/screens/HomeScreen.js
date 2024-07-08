import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {
    View,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    TextInput,
    Animated,
    RefreshControl,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {deleteTodo} from '../utils/dbQueries';
import {useSQLiteContext} from 'expo-sqlite';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import Collapsible from 'react-native-collapsible';
import {scheduleNotification, setupNotifications} from "../utils/notifications";
import {
    calculateReminderTrigger,
    checkIfTodoExpired,
    fetchAllTodos,
    handleCompleteTodo,
    handleCreateTodo, handleRescheduleTodo,
    handleUpdateTodo, showAlert
} from "./functions/functions";
import {styles} from "../styles/homeScreen.styles";

const hourOptions = Array.from({length: 24}, (_, i) => i);
const minuteOptions = Array.from({length: 60}, (_, i) => i);

const HomeScreen = ({ route }) => {
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
            scrollToToday();
        }
    }, [db, isFocused]);

    useEffect(() => {
        if (selectedTodos.length === 0) {
            setIsLongPressed(false);
            animateActionOpacity(0);
        }
    }, [selectedTodos]);

    useEffect(() => {
        if (route.params?.refresh) {
            fetchTodos();
            scrollToToday();
            navigation.setParams({ refresh: undefined });
        }
    }, [route.params?.refresh]);

    useEffect(() => {
        setupNotifications();
    }, []);

    useEffect(() => {
        todos.forEach(todo => {
            if (todo.reminder && !todo.isComplete) {
                scheduleNotification(
                    todo.id,
                    `Reminder: ${todo.value}`,
                    `Your todo "${todo.value}" is due soon.`,
                    calculateReminderTrigger(todo.toBeComplete, todo.reminder)
                );
            }
        });
    }, [todos]);

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
        await fetchAllTodos(db, setTodos, checkIfHasTodosForToday)
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


    const handleRateClick = () => {
        showAlert('Rate us', 'This feature not yet implemented');
    };

    const handleMenuClick = () => {
        showAlert('Menu', 'This feature not yet implemented');
        console.log('open menu');
    };

    const handleCreate = async () => {
        await handleCreateTodo(todoData, reminderHours, reminderMinutes, db);

        const reminderTrigger = calculateReminderTrigger(todoData.toBeComplete, reminderHours, reminderMinutes);
        if (reminderTrigger.seconds > 0) {
            await scheduleNotification(
                todoData.id,
                `Reminder: ${todoData.value}`,
                `Your todo "${todoData.value}" is due soon.`,
                reminderTrigger
            );
        }

        setOpenModal(false);
        handleCleanModalData();
        await fetchTodos();
    };

    const handleUpdate = async () => {
        await handleUpdateTodo(todoData, reminderHours, reminderMinutes, db, todoId)
        const reminderTrigger = calculateReminderTrigger(todoData.toBeComplete, reminderHours, reminderMinutes);
        if (reminderTrigger.seconds > 0) {
            await scheduleNotification(
                todoData.id,
                `Reminder: ${todoData.value}`,
                `Your todo "${todoData.value}" is due soon.`,
                reminderTrigger);
        }

        setOpenModal(false);
        handleCleanModalData();
        await fetchTodos();
    }

    const completeTodo = async (id) => {
        await handleCompleteTodo(id, db)
        await fetchTodos();
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        await fetchTodos()
        setIsLoading(false);
    }

    const handleReschedule = async (id) => {
        await handleRescheduleTodo(id, db, setOpenModal, setActionType, setTodoId, setTodoData, setReminderHours, setReminderMinutes)
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
        return checkIfTodoExpired(timeToExpire)
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
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={handleRefresh}
                            />
                        }
                        keyExtractor={(item) => item}
                        viewabilityConfig={viewabilityConfig}
                        onViewableItemsChanged={viewableItemsChanged.current}
                        renderItem={({item}) => (
                            <View style={styles.grp}>
                                <View style={styles.groupTitle}>
                                    <Text style={styles.dateText}>
                                        {moment(item).isSame(new Date(), 'day') ? "Today" : moment(item).format('ddd')}
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
                                                            {todo.isComplete ? 'Unmark' : 'Mark'} as done
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
                                    style={[styles.selectedAction, {backgroundColor: "#FF6464",}]}>
                                    <MaterialCommunityIcons
                                        name="delete-forever"
                                        size={40}
                                        color="white"
                                    />
                                    <Text style={{color: 'white',}}>{' '}Delete selected</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleClearSelect}>
                                <View
                                    style={[styles.selectedAction, {backgroundColor: "gray",}]}>
                                    <MaterialCommunityIcons
                                        name="close-circle-outline"
                                        size={40}
                                        color="#fff"
                                    />
                                    <Text style={{color: 'white',}}>{' '}Unselect all</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                    <Modal visible={openModal} animationType="slide">
                        <ScrollView contentContainerStyle={{flexGrow: 1}}>
                            <View style={styles.modalContent}>
                                <Text style={[styles.title, {backgroundColor: 'white'}]}>
                                    {actionType === 'update' ? 'Update' : 'Create'}{' '}ToDo
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
                                    minimumDate={new Date()}
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


export default HomeScreen;
