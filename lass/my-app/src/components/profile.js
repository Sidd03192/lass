

import React, { useEffect, useState } from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";
import { Avatar } from "@nextui-org/react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import {Navigate} from 'react-router-dom'
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import getUserData from "@/app/api/route";

export const Profile=(props)=> {
    const cookies = new Cookies();
    const [user, setUser]= useState(getAuth().currentUser);
    const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
    const [email, setEmail] =useState("");
    const [pic, setPic]=useState("");
    console.log(user);

    if (user )
    {
      getUserData(user.uid)
    .then(userData => {
      // Handle the retrieved user data here
      console.log("User ta:", userData);
  
      // Example: Access and save the email
      const email = userData.email;
        setEmail(userData.email);
        setPic(userData.userPicture)
    })
    .catch(error => {
      // Handle errors if any
      console.error("Error fetching user data:", error);
    });
    }

    const logout = () => {
      setIsAuth(false); 
      console.log("hello");
      const auth = getAuth();
      signOut(auth);
      setUser(null); 
    };

    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
              setUser(user);
              setIsAuth(true);
          } else {
              setUser(null);
              setIsAuth(false);
          }
      });

      return () => unsubscribe();
  }, []);

  const login = () => {
    console.log(user);
    return <Navigate to="/login" />;
  };

  const signUp = () => {
     // Redirect to the sign-up page
  };

    if (user){
       

       
        return (
            <div className="profile">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  src={pic}
                  name="null"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{email}</p>
                </DropdownItem>
                <DropdownItem key="settings">
                  My Settings
                </DropdownItem>
                <DropdownItem key="help_and_feedback">
                  Help & Feedback
                </DropdownItem>
                
                <DropdownItem onClick={logout}key="logout" color="danger">
                    

                    Log Out
                   
                  
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            </div>
          );

    }
   
    else{
        return (
            <div className="profile">

          
            <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
               
                name="hi"
              />
            </DropdownTrigger>
            <DropdownMenu  closeOnSelect={false} aria-label="Profile Actions" variant="flat">
              <DropdownItem key="5" className="h-14 gap-2">
                <p className="font-semibold">Not Signed In</p>
                
              </DropdownItem>
              
              <DropdownItem key="g">
                Help & Feedback
              </DropdownItem>
              <DropdownItem onClick={login} key="Sign In" color="success">
              <Link className="hello" to="/signUp"> Sign Up </Link>

                
              </DropdownItem>
              <DropdownItem  key="er" color="success">
                
                <Link className="hello" to="/login"> Log In </Link>
                
              </DropdownItem>

            </DropdownMenu>
          </Dropdown>
          </div>
        );
       
    }
  
}