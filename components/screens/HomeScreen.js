import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {
    View,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Animated,
} from 'react-native';
import {deleteTodo} from '../utils/dbQueries';
import {useSQLiteContext} from 'expo-sqlite';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import moment from 'moment';
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
import {TodoList} from "./lists/TodoList";
import {EditTodoModal} from "./modals/EditTodoModal";
import {hourOptions, minuteOptions} from "./constants/constants";

const HomeScreen = ({route}) => {
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
            navigation.setParams({refresh: undefined});
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
                    <TodoList
                        flatListRef={flatListRef}
                        sortedDates={sortedDates}
                        isLoading={isLoading}
                        handleRefresh={handleRefresh}
                        viewabilityConfig={viewabilityConfig}
                        viewableItemsChanged={viewableItemsChanged}
                        groupedTodos={groupedTodos}
                        selectedTodos={selectedTodos}
                        isLongPressed={isLongPressed}
                        toggleExpand={toggleExpand}
                        addToAction={addToAction}
                        activeSections={activeSections}
                        checkIfExpired={checkIfExpired}
                        handleView={handleView}
                        handleReschedule={handleReschedule}
                        completeTodo={completeTodo}
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
                    <EditTodoModal
                        openModal={openModal}
                        actionType={actionType}
                        todoData={todoData}
                        handleInputChange={handleInputChange}
                        showDatePicker={showDatePicker}
                        isDatePickerVisible={isDatePickerVisible}
                        handleConfirmDate={handleConfirmDate}
                        hideDatePicker={hideDatePicker}
                        reminderHours={reminderHours}
                        reminderMinutes={reminderMinutes}
                        setReminderHours={setReminderHours}
                        setReminderMinutes={setReminderMinutes}
                        handleUpdate={handleUpdate}
                        handleCreate={handleCreate}
                        handleCloseModal={handleCloseModal}
                    />
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
