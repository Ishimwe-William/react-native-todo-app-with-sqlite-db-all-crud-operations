import React, {useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TouchableOpacity, View, Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {handleMenuClick, handleRateClick} from "../screens/functions/functions";
import {styles} from "../styles/homeScreen.styles";

export const useHeaderOptions = ({title}) => {
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                ...styles.headerContainer,
            },
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Text style={styles.title}>{title}</Text>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Feather name={'menu'} size={24} style={styles.headerIcon}/>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={handleRateClick}>
                        <MaterialCommunityIcons
                            name={'star-half-full'}
                            size={24}
                            style={styles.headerIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleMenuClick}>
                        <Feather
                            name={'more-vertical'}
                            size={24}
                            style={styles.headerIcon}
                        />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);
};
