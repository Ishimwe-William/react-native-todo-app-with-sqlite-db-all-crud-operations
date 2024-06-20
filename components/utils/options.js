import {StyleSheet} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export const NavOptions = () => {
    const navigation = useNavigation();

    return {
        // headerTintColor: styles.headerTintColor,
        headerStyle: {
            ...styles.headerContainer,
        },
        headerRight: () => null,
        headerLeft: () => (
            <FontAwesome
                name={'arrow-left'}
                size={20}
                // color={styles.headerIcon.color}
                onPress={() => navigation.goBack()}
                style={{paddingLeft: 15}}
            />
        )
    };
};

const styles = StyleSheet.create({
   headerContainer: {
        backgroundColor: '#000',
    },
    headerTintColor: {
        color: 'white',
    },

})