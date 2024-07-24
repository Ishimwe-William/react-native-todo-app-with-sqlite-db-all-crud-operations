import {Image, View} from "react-native";

export const CircleLogo = () => {
    return (
        <View style={{justifyContent: 'center', alignItems:'center'}}>
            <Image source={require("../../assets/icon_image.png")} style={{
                width: 110,
                height: 110,
                marginVertical:20,
            }}/>
        </View>
    )
}