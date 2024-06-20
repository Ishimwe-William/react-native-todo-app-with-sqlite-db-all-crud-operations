import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { getAllTodos, deleteTodo } from  '../utils/dbQueries';
import { useSQLiteContext } from 'expo-sqlite';

const DeleteTodoScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const result = await getAllTodos(db);
      setTodos(result);
    };
    fetchTodos();
  }, [db]);

  const handleDelete = async (id) => {
    await deleteTodo(db, id);
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{`${item.id} - ${item.value}`}</Text>
      <Button
        title="Delete"
        onPress={() => handleDelete(item.id)}
        style={{ marginLeft: 'auto' }}
      />
    </View>
  );

  return (
    <View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default DeleteTodoScreen;