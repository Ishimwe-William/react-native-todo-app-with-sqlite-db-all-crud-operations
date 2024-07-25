import React from 'react';
import { Image, View } from 'react-native';

export const CircleLogo = ({ source }) => {
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={source} style={styles.image} />
        </View>
    );
};

const styles = {
    image: {
        width: 110,
        height: 110,
        marginVertical: 20,
        borderRadius: 55, // to make the image circular
    },
};
