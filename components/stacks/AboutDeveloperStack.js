import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {NavOptions} from '../utils/options'
import {AboutDeveloper} from "../screens/AboutDeveloper";

const Stack = createStackNavigator();

export const AboutDeveloperStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Developer" component={AboutDeveloper} screenOptions={NavOptions}/>
        </Stack.Navigator>
    );
};

