import Text from "@kaloraat/react-native-text";
import {useHeaderOptions} from "../hooks/useHeaderOptions";

export const AboutDeveloper = () => {
    useHeaderOptions({title: "Developer"});

    return (
        <Text large center>About Developer...</Text>
    )
}