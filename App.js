import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import HomeStack from './components/stacks/HomeStack';
import ViewTodosScreen from './components/screens/ViewTodosScreen';
import EditTodoScreen from './components/screens/EditTodoScreen';
import DeleteTodoScreen from './components/screens/DeleteTodoScreen';
import { migrateDbIfNeeded } from './components/utils/dbMigrations';

const Drawer = createDrawerNavigator();

export default function App({ navigation }) {
  return (
    <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Drawer.Screen name="Home Stack" component={HomeStack} />
          <Drawer.Screen name="View Todos" component={ViewTodosScreen} />
          <Drawer.Screen name="Edit Todo" component={EditTodoScreen} />
          <Drawer.Screen name="Delete Todo" component={DeleteTodoScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SQLiteProvider>
  );
}
