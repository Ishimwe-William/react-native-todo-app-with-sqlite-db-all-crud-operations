import {TouchableOpacity} from "react-native";
import Text from "@kaloraat/react-native-text";

export const SubmitButton = (
    {
        title,
        handleSubmit,
        loading,
    }) => {

    return (
        <TouchableOpacity
            onPress={handleSubmit}
            style={{
                backgroundColor: '#5A9AA9',
                height: 50,
                marginBottom: 20,
                justifyContent: 'center',
                marginHorizontal: 15,
                borderRadius: 24,
            }}
        >
            <Text bold medium center color={"#fff"}>{loading ? 'Please wait...' : title}</Text>

        </TouchableOpacity>
    )
}
