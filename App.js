import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import HomeStack from './components/stacks/HomeStack';
import ViewTodosScreen from './components/screens/ViewTodosScreen';
import EditTodoScreen from './components/screens/EditTodoScreen';
import DeleteTodoScreen from './components/screens/DeleteTodoScreen';
import { migrateDbIfNeeded } from './components/utils/dbMigrations';
import { setupNotificationListener, setupNotifications } from './components/utils/notifications';
import * as Notifications from 'expo-notifications';
import { registerBackgroundTask } from './components/utils/backgroundTask';
import { navigationRef } from './components/utils/navigationRef';

const Drawer = createDrawerNavigator();

export default function App() {
    useEffect(() => {
        setupNotifications();
        setupNotificationListener();
        const askPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('You need to grant permissions to use notifications.');
            }
        };
        askPermissions();
        registerBackgroundTask();
    }, []);

    return (
        <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
            <NavigationContainer ref={navigationRef}>
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
