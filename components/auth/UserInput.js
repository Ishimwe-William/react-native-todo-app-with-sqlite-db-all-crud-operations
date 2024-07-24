import React, from "react";
import {View, TextInput, TouchableOpacity} from 'react-native';
import Text from '@kaloraat/react-native-text';
import Feather from "react-native-vector-icons/Feather";

export const UserInput = (
    {
        name,
        value,
        setValue,
        autoComplete = 'off',
        autoCapitalize = 'none',
        keyboardType = 'default',
        isHidden,
        setIsHidden,
    }
) => {


    return (
        <View style={{marginHorizontal: 24}}>
            <Text semi color="#5A9AA9">{name}</Text>
            <TextInput
                style={{
                    borderBottomWidth: 0.5,
                    height: 40,
                    borderBottomColor: "#5A9AA9",
                    marginBottom: 30,
                }}
                value={value}
                onChangeText={(text) => setValue(text)}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                autoComplete={autoComplete}
                keyboardType={keyboardType}
                secureTextEntry={isHidden}
            />
            {name.toLowerCase() === "password" && (
                <TouchableOpacity
                    onPress={() => setIsHidden(!isHidden)}
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 50
                }}
                >
                    <Feather name={isHidden ? "eye" : "eye-off"} size={24} color="#5A9AA9" />
                </TouchableOpacity>
            )}
        </View>
    )
}
