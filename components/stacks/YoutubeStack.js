import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {NavOptions} from '../utils/options'
import {YoutubeWebView} from "../screens/YoutubeWebView";

const Stack = createStackNavigator();

const YoutubeStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={YoutubeWebView} screenOptions={NavOptions}/>
        </Stack.Navigator>
    );
};

export default YoutubeStack;
