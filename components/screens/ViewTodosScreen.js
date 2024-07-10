import { useEffect, useState } from 'react';
import { View, ScrollView, Text, FlatList } from 'react-native';
import { getAllTodos } from '../utils/db/dbQueries';
import { useSQLiteContext } from 'expo-sqlite';

const ViewTodosScreen = () => {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const result = await getAllTodos(db);
      setTodos(result);
    };
    fetchTodos();
  }, [db]);

  return (
    <ScrollView>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{`${item.id} - ${item.value}`}</Text>
            <Text>{`${item.description} | ${item.isComplete}`}</Text>
            <Text>{`${new Date(item.created)} - ${new Date(item.toBeComplete)}`}</Text>
            <Text>----------------------------------------</Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default ViewTodosScreen;