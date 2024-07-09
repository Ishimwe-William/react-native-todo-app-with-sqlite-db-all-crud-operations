import {FlatList, RefreshControl, Text, TouchableOpacity, View} from "react-native";
import {styles} from "../../styles/homeScreen.styles";
import moment from "moment";
import Collapsible from "react-native-collapsible";
import Feather from "react-native-vector-icons/Feather";
import React from "react";

export const TodoList = (
    {
        flatListRef,
        sortedDates,
        isLoading,
        handleRefresh,
        viewabilityConfig,
        viewableItemsChanged,
        groupedTodos, selectedTodos, isLongPressed,
        toggleExpand,
        addToAction,
        activeSections,
        checkIfExpired,
        handleView,
        handleReschedule,
        completeTodo,
    }) => {
    return (
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
                                                <TouchableOpacity
                                                    style={styles.viewBtn}
                                                    onPress={() => handleView(todo.id)}>
                                                    <Text style={{color: '#5A9AA9'}}>View</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.rescheduleBtn}
                                                    onPress={() => handleReschedule(todo.id)}>
                                                    <Text style={{color: '#5A9AA9'}}>{<Feather
                                                        name={'clock'} size={16}
                                                        color={'#5A9AA9'}/>}{' '}Reschedule</Text>
                                                </TouchableOpacity>
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
        />)
}