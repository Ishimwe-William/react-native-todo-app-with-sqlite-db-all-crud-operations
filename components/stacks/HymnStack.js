import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {NavOptions} from '../utils/options'
import {SendHymnNumberToRTDB} from "../screens/SendHymnNumberToRTDB";

const Stack = createStackNavigator();

export const HymnStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Hymn" component={SendHymnNumberToRTDB} screenOptions={NavOptions}/>
        </Stack.Navigator>
    );
};

