import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput } from 'react-native';
import { getAllTodos, updateTodo } from  '../utils/dbQueries';
import { useSQLiteContext } from 'expo-sqlite';

const EditTodoScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [newIntValue, setNewIntValue] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      const result = await getAllTodos(db);
      setTodos(result);
    };
    fetchTodos();
  }, [db]);

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setNewValue(todo.value);
    setNewIntValue(todo.intValue.toString());
  };

  const handleUpdate = async () => {
    if (editingTodo) {
      await updateTodo(db, editingTodo.id, newValue, parseInt(newIntValue));
      const updatedTodos = todos.map((todo) =>
        todo.id === editingTodo.id ? { ...todo, value: newValue, intValue: parseInt(newIntValue) } : todo
      );
      setTodos(updatedTodos);
      setEditingTodo(null);
      setNewValue('');
      setNewIntValue('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{`${item.intValue} - ${item.value}`}</Text>
      <Button
        title="Edit"
        onPress={() => handleEdit(item)}
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
      {editingTodo && (
        <View>
          <TextInput
            placeholder="Todo value"
            value={newValue}
            onChangeText={setNewValue}
          />
          <TextInput
            placeholder="Integer value"
            value={newIntValue}
            onChangeText={setNewIntValue}
            keyboardType="numeric"
          />
          <Button title="Update Todo" onPress={handleUpdate} />
        </View>
      )}
    </View>
  );
};

export default EditTodoScreen;