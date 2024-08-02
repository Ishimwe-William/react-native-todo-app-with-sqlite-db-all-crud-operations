import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import Text from '@kaloraat/react-native-text';

export const SignupWith3rdPartiesButton = ({ source, title, handleSubmit, loading }) => {
    return (
        <TouchableOpacity
            onPress={!loading ? handleSubmit : null}
            style={styles.button}
        >
            <Image source={source} style={styles.image} />
            <View style={styles.textContainer}>
                <Text bold medium style={styles.text}>
                    {loading ? 'Please wait...' : title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: 50,
        marginBottom: 20,
        marginHorizontal: 15,
        borderRadius: 24,
    },
    image: {
        width: 47,
        height: 47,
        marginVertical: 2,
        borderRadius: 55,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#5A9AA9',
    },
});
