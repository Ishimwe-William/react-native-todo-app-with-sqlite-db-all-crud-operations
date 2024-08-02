import {TouchableOpacity, StyleSheet} from "react-native";
import Text from '@kaloraat/react-native-text'

export const TermsPolicyLink = ({title, onClick}) => {
    return (
        <TouchableOpacity style={styles.text} onPress={onClick}>
            <Text center color={'#5A9AA9'}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    text: {
        marginVertical:10,
    }
})