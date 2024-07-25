import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TodoDetailsScreen from '../screens/TodoDetailsScreen';
import {NavOptions} from '../utils/options'

const Stack = createStackNavigator();

export const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} screenOptions={NavOptions}/>
      <Stack.Screen name="TodoDetails" component={TodoDetailsScreen} screenOptions={NavOptions} />
    </Stack.Navigator>
  );
};

