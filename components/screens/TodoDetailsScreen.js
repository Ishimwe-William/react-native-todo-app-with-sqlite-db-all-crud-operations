import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getTodoById } from '../utils/dbQueries';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const TodoDetailsScreen = ({ route }) => {
  const { id } = route.params;
  const db = useSQLiteContext();
  const [todo, setTodo] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTodo = async () => {
      console.log(id)
      const result = await getTodoById(db, id);
      setTodo(result[0]);
    };
    fetchTodo();
  }, [db, id]);

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
          <Feather name={'arrow-left'} size={24} style={styles.headerIcon} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
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

  if (!todo) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <View style={styles.todoItem}>
      <Text style={styles.title}>{todo.value}</Text>
      <Text style={styles.description}>{todo.description}</Text>
      <Text style={styles.date}>
        To be completed by: {new Date(todo.toBeComplete).toLocaleString()}
      </Text>
      <Text style={styles.date}>
        Created on: {new Date(todo.created).toLocaleString()}
      </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#5A9AA9',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5A9AA9',
    marginVertical: 5,
    textAlign: 'center',
    padding: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding:10,
    marginRight: 10,
    marginLeft: 5,
  },
});

export default TodoDetailsScreen;
