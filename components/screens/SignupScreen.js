import {useState} from "react";
import {ScrollView} from 'react-native';
import Text from '@kaloraat/react-native-text';
import {UserInput} from "../auth/UserInput";
import {SubmitButton} from "../auth/SubmitButton";
import axios from "axios";
import {CircleLogo} from "../auth/CircleLogo";
import {LineTextLine} from "../auth/LineTextLine";
import {SignupWith3rdPartiesButton} from "../auth/SignupWith3rdPartiesButton";
import {TermsPolicyLink} from "../auth/TermsPolicy";

export const SignupScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isHidden, setIsHidden] = useState(true);

    const handleSubmit = async () => {
        setIsLoading(true);

        if (!name || !email || !password) {
            alert("All fields are required");
            setIsLoading(false);
            return;
        }

        try {
            const {data} = await axios.post("http://localhost:8000/api/signup", {
                name,
                email,
                password,
            })
            console.log("SIGN IN SUCCESS => ", data);
            alert("Sign up successful");
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                // marginTop: 10,
            }}>
            <CircleLogo source={require('../../assets/icon_image.png')}/>
            <Text title center>Sign Up</Text>
            <UserInput
                name="NAME"
                value={name}
                setValue={setName}
                autoCapitalize={"words"}
            />
            <UserInput
                name="EMAIL"
                value={email}
                setValue={setEmail}
                autoComplete={'email'}
                keyboardType={"email-address"}
            />
            <UserInput
                name="PASSWORD"
                value={password}
                setValue={setPassword}
                secureTextEntry={isHidden}
                autoComplete={"new-password"}
                setIsHidden={setIsHidden}
                isHidden={isHidden}
            />

            <SubmitButton title={"Sign Up"} handleSubmit={handleSubmit} loading={isLoading}/>
            <LineTextLine text={'Or'}/>
            <SignupWith3rdPartiesButton
                source={require('../auth/img/google-logo-6278331_640.png')}
                title={'Sign up with Google'}
                handleSubmit={() => console.log('google signup')}
                loading={false}
            />
            <SignupWith3rdPartiesButton
                source={require('../auth/img/github-6980894_640.png')}
                title={'Sign up with Github'}
                handleSubmit={() => console.log('github signup')}
                loading={false}
            />
            <TermsPolicyLink title={'Terms & Policy'} onClick={()=>console.log('Terms clicked')}/>
        </ScrollView>
    )
}
