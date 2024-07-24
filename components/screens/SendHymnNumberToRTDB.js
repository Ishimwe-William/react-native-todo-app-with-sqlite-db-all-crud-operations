import {ScrollView, View} from "react-native";
import Text from "@kaloraat/react-native-text"
import {UserInput} from "../auth/UserInput";
import Constants from "expo-constants";
import {useState} from "react";
import {CircleLogo} from "../auth/CircleLogo";
import {SubmitButton} from "../auth/SubmitButton";
import {SuccessPopupMessage} from "../auth/SuccessPopupMessage";

export const SendHymnNumberToRTDB = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({
        hymn1: '',
        hymn2: '',
        hymn3: '',
    });
    const [hymns, setHymns] = useState({
        hymn1: "",
        hymn2: "",
        hymn3: "",
    });

    const validateFields = () => {
        let isValid = true;
        const newErrors = {
            hymn1: '',
            hymn2: '',
            hymn3: '',
        };

        if (!hymns.hymn1 && !hymns.hymn2 && !hymns.hymn3) {
            isValid = false;
            newErrors.hymn1 = 'At least one field is required';
            setErrors(newErrors);
            return isValid;
        }

        if (!/^\d+$/.test(hymns.hymn1) && hymns.hymn1) {
            newErrors.hymn1 = 'Hymn 1 input should be numeric';
            isValid = false;
        } else if (parseInt(hymns.hymn1) < 1 || parseInt(hymns.hymn1) > 2000) {
            newErrors.hymn1 = 'Hymn 1 must be between 1 and 2000';
            isValid = false;
        }

        if (!/^\d+$/.test(hymns.hymn2) && hymns.hymn2) {
            newErrors.hymn2 = 'Hymn 2 input should be numeric';
            isValid = false;
        } else if (parseInt(hymns.hymn2) < 1 || parseInt(hymns.hymn2) > 2000) {
            newErrors.hymn2 = 'Hymn 2 must be between 1 and 2000';
            isValid = false;
        }

       else if (!/^\d+$/.test(hymns.hymn3) && hymns.hymn3) {
            newErrors.hymn3 = 'Hymn 3 input should be numeric';
            isValid = false;
        } else if (parseInt(hymns.hymn3) < 1 || parseInt(hymns.hymn3) > 2000) {
            newErrors.hymn3 = 'Hymn 3 must be between 1 and 2000';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCleanInputs = () => {
        setHymns({
            hymn1: "",
            hymn2: "",
            hymn3: "",
        })
    }
    const handleOnChange = (name, value) => {
        setHymns((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));
    };

    const handleSubmit = () => {
        if (validateFields()) {
            setIsLoading(true);
            try {
                // Todo: submission logic here

                // Show success message
                setShowSuccess(true);

                // Hide success message after 4 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                }, 7000);

                handleCleanInputs();
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle=
                        {{
                            flexGrow: 1,
                            justifyContent: 'center',
                            marginTop: Constants.statusBarHeight
                        }}>
            {showSuccess && (
                <SuccessPopupMessage text={"Hymn numbers sent successfully!"}/>
            )}
            <CircleLogo source={require('../../assets/music_note.png')}/>
            <Text title center>Hymn Number</Text>
            <View style={{marginTop: 30}}>
                <UserInput
                    name="hymn1"
                    label='HYMN 1'
                    value={hymns.hymn1.toString()}
                    setValue={(value) => handleOnChange("hymn1", value)}
                    keyboardType='numeric'
                    error={errors.hymn1}
                />
                <UserInput
                    name="hymn2"
                    label='HYMN 2'
                    value={hymns.hymn2.toString()}
                    setValue={(value) => handleOnChange("hymn2", value)}
                    keyboardType='numeric'
                    error={errors.hymn2}
                />
                <UserInput
                    name='hymn3'
                    label='HYMN 3'
                    value={hymns.hymn3.toString()}
                    setValue={(value) => handleOnChange("hymn3", value)}
                    keyboardType='numeric'
                    error={errors.hymn3}
                />
            </View>
            <SubmitButton title={"Set Hymns"} handleSubmit={handleSubmit} loading={isLoading}/>
        </ScrollView>
    )
}