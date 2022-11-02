import React from 'react';
import './App.css';
import {useEffect, useState} from "react";
import jwt_decode from 'jwt-decode';
import Login from './components/Login'
import {ApolloProvider, ApolloClient, InMemoryCache} from "@apollo/client";
import { useGoogleLogin,  } from '@react-oauth/google';


const client = new ApolloClient({
    uri: 'http://localhost:5000/graphql',
    cache: new InMemoryCache()
});

function App() {
  const [user, setUser]:any = useState({});

   function handleCallbackResponse(response: any){
    let userObject =  jwt_decode(response.credential);
    console.log(userObject);
       setUser(userObject);
       // @ts-ignore
       document.getElementById('signInDiv').hidden = true
  }
  function handleSignOut(e:any){
       setUser({});
      // @ts-ignore
      document.getElementById('signInDiv').hidden = false
  }

  useEffect(()=>{
    /* global google */
    google.accounts.id.initialize({
      client_id: "1053437263950-d5d8ccirrvt942lva50m8qnl560ukld3.apps.googleusercontent.com",
      callback: handleCallbackResponse
    });

    google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById('signInDiv'),
        {theme: 'outline', size: "large"}
    );
    google.accounts.id.prompt();
  }, [])


    return (
    <>
        <ApolloProvider client={client}>
            <div className="App">
                <div id="signInDiv"></div>
                {Object.keys(user).length != 0 &&
                    <button onClick={ (e) => handleSignOut(e)}>Sign Out</button>
                }

                {user &&
                    <div>
                        <h2>{user.name}</h2>
                        <img src={user.picture}/>

                    </div>
                }

            </div>
        </ApolloProvider>
        </>
        
  );
}

export default App;
