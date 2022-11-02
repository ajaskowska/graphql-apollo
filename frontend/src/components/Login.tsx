import {GoogleLogin} from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import {useGoogleLogin} from '@react-oauth/google';
import axios from "axios";


function Login() {
    // const login = useGoogleLogin({
    //     // onSuccess: tokenResponse => console.log(tokenResponse)
    //     onSuccess: async tokenResponse => {
    //         await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    //             headers: {
    //                 "Authorization": `Bearer ${tokenResponse}`
    //             }
    //         });
    //     }
    // });

    const login = useGoogleLogin({
        // scope: [email, profile],
        onSuccess: async response => {
            try {
                const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        "Authorization": `Bearer ${response.access_token}`
                    }
                });
                console.log(response);
                console.log(res.data);
            } catch (err) {
                console.log(err);
            }
        }
    });


    const google = () => {
        window.open("http://localhost:3000/login", "_self");
    };

    return (
        <div>
            {/*<GoogleLogin*/}
            {/*    onSuccess={credentialResponse => {*/}
            {/*        console.log(credentialResponse);*/}
            {/*        let userObject = jwt_decode(credentialResponse.credential);*/}
            {/*        console.log(userObject);*/}
            {/*        // console.log(credentialResponse.credential);*/}
            {/*    }}*/}
            {/*    onError={() => {*/}
            {/*        console.log('Login Failed');*/}
            {/*    }}*/}
            {/*/>*/}
            {/*<button onClick={login}>Login with Google</button>*/}
            <button onClick={google}>Login</button>
        </div>
    );
}


export default Login;