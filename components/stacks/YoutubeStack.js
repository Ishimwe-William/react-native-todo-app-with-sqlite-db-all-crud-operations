import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {NavOptions} from '../utils/options'
import {YoutubeWebView} from "../screens/YoutubeWebView";

const Stack = createStackNavigator();

export const YoutubeStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Youtube" component={YoutubeWebView} screenOptions={NavOptions}/>
        </Stack.Navigator>
    );
};

