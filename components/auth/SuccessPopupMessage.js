import Text from "@kaloraat/react-native-text";
import {View} from "react-native";

export const SuccessPopupMessage = ({text}) => {

    return (
        <View style={{
            backgroundColor: 'green',
            padding: 10,
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            zIndex: 1,
            borderRadius: 5,
            marginHorizontal:20,
        }}>
            <Text color='white' center>{text}</Text>
        </View>
    )
}