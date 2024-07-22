import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {styles} from "../styles/homeScreen.styles";
import Feather from "react-native-vector-icons/Feather";
import {useNavigation} from "@react-navigation/native";
import { WebView } from 'react-native-webview';
import {useIsFocused} from "@react-navigation/native";
import {ytb_styles} from "../styles/youtubeWebViewScreen.styles";

export const YoutubeWebView = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [key, setKey] = useState(0);

    const handleReRender = () => {
        setKey(prevKey => prevKey + 1);
    };

    const handleMenuClick = () => {

    }
    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                ...styles.headerContainer,
            },
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.title}>Youtube Channel</Text>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Feather name={'menu'} size={24} style={styles.headerIcon}/>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{flexDirection: 'row'}}>
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
    }, []);


    useEffect(() => {
        if (isFocused) {
            // Trigger re-render on screen focus
            handleReRender();
        }
    }, [isFocused]);

    return (
        <View style={ytb_styles.container}>
            <WebView
                key={key}
                source={{ uri: 'https://www.youtube.com/@ishimwewilliam' }}
            />
            <TouchableOpacity style={ytb_styles.refreshBtn} onPress={handleReRender}>
                <Text style={ytb_styles.refreshBtnText}>Refresh WebView</Text>
            </TouchableOpacity>
        </View>
    );
};

