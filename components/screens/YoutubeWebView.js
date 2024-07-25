import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import { WebView } from 'react-native-webview';
import {useIsFocused} from "@react-navigation/native";
import {ytb_styles} from "../styles/youtubeWebViewScreen.styles";
import {useHeaderOptions} from "../hooks/useHeaderOptions";

export const YoutubeWebView = () => {
    const isFocused = useIsFocused();
    const [key, setKey] = useState(0);

    const handleReRender = () => {
        setKey(prevKey => prevKey + 1);
    };

    useHeaderOptions({title:"Youtube Channel"});

    useEffect(() => {
        if (isFocused) {
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

