import React, {useContext, useEffect, useState} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {CircleLogo} from '../auth/CircleLogo';
import {UserInput} from '../auth/UserInput';
import {SubmitButton} from '../auth/SubmitButton';
import {SuccessPopupMessage} from '../auth/SuccessPopupMessage';
import {ref, set, onValue} from 'firebase/database';
import {auth, database} from "../firebase/firebaseConfig";
import {useHeaderOptions} from "../hooks/useHeaderOptions";
import {useIsFocused} from "@react-navigation/native";
import {onAuthStateChanged} from "firebase/auth";
import {NetworkContext} from '../contexts/NetworkContext';
import {ErrorPopupMessage} from "../auth/ErrorPopupMessage"; // Import the NetworkContext

export const SendHymnNumberToRTDB = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [user, setUser] = useState(null);
    const isFocused = useIsFocused();
    const isConnected = useContext(NetworkContext);
    const [errors, setErrors] = useState({
        hymn1: '',
        hymn2: '',
        hymn3: '',
    });
    const [hymns, setHymns] = useState({
        hymn1: '',
        hymn2: '',
        hymn3: '',
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    // Fetch hymns from Firebase
    useEffect(() => {
        const hymnsRef = ref(database, 'hymns');
        const unsubscribe = onValue(hymnsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHymns(data);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isFocused]);

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

        const hymnValidation = (hymn, key) => {
            if (hymn) {
                if (!/^\d+$/.test(hymn)) {
                    newErrors[key] = `${key.toUpperCase()} input should be numeric`;
                    isValid = false;
                } else if (parseInt(hymn) < 1 || parseInt(hymn) > 2000) {
                    newErrors[key] = `${key.toUpperCase()} must be between 1 and 2000`;
                    isValid = false;
                }
            }
        };

        hymnValidation(hymns.hymn1, 'hymn1');
        hymnValidation(hymns.hymn2, 'hymn2');
        hymnValidation(hymns.hymn3, 'hymn3');

        setErrors(newErrors);
        return isValid;
    };

    const handleCleanInputs = () => {
        setHymns({
            hymn1: '',
            hymn2: '',
            hymn3: '',
        });
    };

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


    const handleSubmit = async () => {

        if (!user) {
            Alert.alert("Error", "Not authorized to submit hymn numbers.");
            return;
        }

        if (!isConnected) {
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
            }, 7000);
            return;
        }

        if (validateFields()) {
            setIsLoading(true);
            try {
                const hymnsRef = ref(database, 'hymns');
                await set(hymnsRef, hymns);
                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
                }, 7000);

                handleCleanInputs();
            } catch (e) {
                console.log(e);
                Alert.alert("Error", "Failed to submit hymn numbers.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useHeaderOptions({title: "Hymn Numbers"});

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
            }}
        >
            {showSuccess && <SuccessPopupMessage text="Hymn numbers sent successfully!"/>}
            {showError && <ErrorPopupMessage text="No network connection. Please try again later."/>}
            <CircleLogo source={require('../../assets/music_note.png')}/>
            <View style={{marginTop: 10}}>
                <UserInput
                    name="hymn1"
                    label="HYMN 1"
                    value={hymns.hymn1}
                    setValue={(value) => handleOnChange('hymn1', value)}
                    keyboardType="numeric"
                    error={errors.hymn1}
                />
                <UserInput
                    name="hymn2"
                    label="HYMN 2"
                    value={hymns.hymn2}
                    setValue={(value) => handleOnChange('hymn2', value)}
                    keyboardType="numeric"
                    error={errors.hymn2}
                />
                <UserInput
                    name="hymn3"
                    label="HYMN 3"
                    value={hymns.hymn3}
                    setValue={(value) => handleOnChange('hymn3', value)}
                    keyboardType="numeric"
                    error={errors.hymn3}
                />
            </View>
            <SubmitButton title="Set Hymns" handleSubmit={handleSubmit} loading={isLoading}/>
        </ScrollView>
    );
};
