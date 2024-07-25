import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {SQLiteProvider, useSQLiteContext} from 'expo-sqlite';
import {StatusBar} from 'expo-status-bar';
import {HomeStack} from './components/stacks/HomeStack';
import {migrateDbIfNeeded} from './components/utils/db/dbMigrations';
import {setupNotificationListener, setupNotifications} from './components/utils/notifications';
import {registerBackgroundTask} from './components/utils/backgroundTask';
import {navigationRef} from './components/utils/navigationRef';
import * as Notifications from "expo-notifications";
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Text, View} from "react-native";
import {DrawerColorProvider} from "./components/contexts/DrawerColorContext";
import {YoutubeStack} from "./components/stacks/YoutubeStack";
import {SignupScreen} from "./components/screens/SignupScreen";
import {HymnStack} from "./components/stacks/HymnStack";
import {AboutDeveloperStack} from "./components/stacks/AboutDeveloperStack";

const Drawer = createDrawerNavigator();

const AppContent = () => {
    const db = useSQLiteContext();

    useEffect(() => {
        setupNotifications();
        setupNotificationListener(db);
        const askPermissions = async () => {
            const {status} = await Notifications.requestPermissionsAsync();
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
                <Drawer.Screen
                    name="Home Stack"
                    component={HomeStack}
                    options={() => ({
                        drawerLabel: ({focused}) => (
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center'
                            }}>
                                <AntDesign name="home" size={28} color={focused ? '#5A9AA9' : 'gray'}/>
                                <Text
                                    style={{color: focused ? '#5A9AA9' : 'gray'}}
                                >{" "}Your Todos</Text>
                            </View>
                        ),
                    })}
                />
                <Drawer.Screen
                    name="View Todos"
                    component={YoutubeStack}
                    options={() => ({
                        drawerLabel: ({focused}) => (
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center'
                            }}>
                                <AntDesign name="youtube" size={28} color={focused ? 'red' : 'gray'}/>
                                <Text
                                    style={{color: focused ? 'red' : 'gray'}}
                                >{" "}Youtube</Text>
                            </View>
                        ),
                    })}
                />
                <Drawer.Screen name="Sign Up [demo]" component={SignupScreen}/>
                <Drawer.Screen name="Send Data to RTDB" component={HymnStack}/>
                <Drawer.Screen name="About Developer" component={AboutDeveloperStack}/>
            </Drawer.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
            <DrawerColorProvider>
                <AppContent/>
                <StatusBar style="auto"/>
            </DrawerColorProvider>
        </SQLiteProvider>
    );
}
