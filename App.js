import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import HomeStack from './components/stacks/HomeStack';
import ViewTodosScreen from './components/screens/ViewTodosScreen';
import EditTodoScreen from './components/screens/EditTodoScreen';
import DeleteTodoScreen from './components/screens/DeleteTodoScreen';
import { migrateDbIfNeeded } from './components/utils/db/dbMigrations';
import { setupNotificationListener, setupNotifications } from './components/utils/notifications';
import { registerBackgroundTask } from './components/utils/backgroundTask';
import { navigationRef } from './components/utils/navigationRef';
import * as Notifications from "expo-notifications";

const Drawer = createDrawerNavigator();

const AppContent = () => {
    const db = useSQLiteContext();

    useEffect(() => {
        setupNotifications();
        setupNotificationListener(db);
        const askPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('You need to grant permissions to use notifications.');
            }
        };
        askPermissions();
        registerBackgroundTask();
    }, [db]);

    return (
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
    );
};

export default function App() {
    return (
        <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
            <AppContent />
            <StatusBar style="auto" />
        </SQLiteProvider>
    );
}
