"use client"

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { Autocomplete, AutocompleteItem, Button, Checkbox, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Cookies from "universal-cookie";
import "../../../styles/globals.css";
import { db, provider } from "../../firebase/firebase";
import "../auth.css";
import { EyeFilledIcon } from "../components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../components/EyeSlashFilledIcon";
import { MailIcon } from '../components/MailIcon';
import { UserCard } from "../components/card";
import { animals } from "../data";



export default function Page() {
  const cookies = new Cookies();
  const ath = getAuth();

  const [userData, setUserData] = useState({
    userName: "",
    userPicture: "",
    userId: "",
    role: "student",
    school: "",
    email: "",
    password: "",
    classrooms: [0]

  });

  const [isVisible, setIsVisible] = useState(false);
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [schools, setSchools] = useState([]);
  const [school, setSchool] = useState("");
  const [role, setRole] = useState("")
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for Snackbar message
  const vertical = "top"
  const horizontal = "center"
  const [success, setSuccess] = useState("")
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [read, setRead] = useState(false);
  const isLoginEnabled = true;
  const scrollBehavior = "outside";
  const getSchools = async () => {
    try {
      const allSchools = [];
      const querySnapshot = await getDocs(collection(db, "schools"));
      querySnapshot.forEach((doc) => {
        const newObject = { ...doc.data(), id: doc.id };
        allSchools.push(newObject);
      });
      setSchools(allSchools); // Update 'schools' state
    } catch (error) {
      console.error("Error fetching collection data:", error);
    }
  };

  // Call 'getSchools' inside the useEffect hook
  useEffect(() => {

    console.log(school);
    getSchools(); // Fetch schools when component mounts
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser != null) {
        cookies.set("auth-token", authUser.refreshToken); //navigate("./dash");

      }
    });
  })
  const setSkhool = (id) => {
    setUserData({ ...userData, school: id });
    setUserData({ ...userData, school: id });

    console.log(userData.school);

  };
  const signInWithGoogle = async () => {

    if (userData.school != "" && userData.school != null && userData.userName != null) {
      try {
        console.log("Attempting Google Sign-In...");
        const result = await signInWithPopup(auth, provider);
        console.log(" new uid" + result.user.uid);
        console.log("Google Sign-In Result:", result);

        // Extract user information from the result object
        const { email, displayName, photoURL } = result.user;

        // Update states with the extracted user information
        setEmail(email);
        setUserData({ ...userData, userId: result.user.uid });

        setUserData({ ...userData, email: email, userId: result.user.uid })
        setUserData(prevState => ({
          ...prevState,
          userName: displayName,
          userPicture: photoURL,
          email: email,
          userId: result.user.uid
        }));

        cookies.set("auth-token", result.user.refreshToken);

        // Update Firestore database with user information
        updateUserDataInFirestore(email, displayName, photoURL);

        // Handle sign-in success
        handleSignInSuccess("Google sign-in successful!", "success");

      } catch (err) {
        console.error("Google Sign-In Error:", err.message);
        handleSignInSuccess("Problem with Google Sign in ", "warning");
      }
    }
    else {
      handleSignInSuccess("Please make sure to accept the terms and conditions & select your school", "warning");
    }

  }
  const handleSignInSuccess = (message, fortune) => {
    setOpenSnackbar(true); // Open the Snackbar
    setSnackbarMessage(message); // Set the Snackbar message
    setSuccess(fortune); // Set the
  };

  // Move the declaration of 'schools' state inside the component

  const updateUserDataInFirestore = (Email, displayName, photoURL) => {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    console.log
    setDoc(userDocRef, {
      email: Email,
      userName: displayName,
      userPicture: photoURL,
      userId: ath.currentUser.uid,
      role: userData.role,
      school: userData.school || school,
      classrooms: [0]

      // Add other user details as needed
    }, { merge: true })
      .then(() => {
        console.log("User data updated in Firestore successfully");
      })
      .catch((error) => {
        console.error("Error updating user data in Firestore:", error);
      });
  };


  const handleCheckboxChange = () => {
    console.log("Checkbox changed");
  };

  const userImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      // Update the user picture state with the base64 representation of the uploaded image
      setUserData(prevState => ({
        ...prevState,
        userPicture: reader.result
      }));
    };

    if (file) {
      reader.readAsDataURL(file); // Read the file as a data URL (base64)
    }
  };
  const validateEmail = (email) => userData.email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
  const isInvalid = React.useMemo(() => {
    if (userData.email === "") return false;

    return validateEmail(userData.email) ? false : true;
  }, [userData.email]);

  const handleSignIn = async (event) => {
    console.log("attempting sign up");

    try {
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      console.log("create user result:", result);
      console.log(result.user.uid);





      cookies.set("auth-token", result.user.refreshToken);
      const newId = result.user.uid;
      console.log("New User ID:" + newId);
      setUserData({ ...userData, userId: newId });
      console.log(userData.userId);
      createUser(newId)
      handleSignInSuccess("Account Created!", "success");

    } catch (err) {
      console.error("Email/Password Sign-In Error:", err.message);
      handleSignInSuccess("Problem Creating Account. Make sure your Password is 6+ characters. This email may also already be in use. ", "warning");
    }
  };




  const createUser = async (id) => {
    console.log('userData:', userData);

    try {
      console.log("Created User ID:" + id);
      const userDocRef = doc(db, 'users', id); // Specify the document reference
      await setDoc(userDocRef, userData); // Set document data
      console.log('Document written with ID:', id); // Log the provided ID
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };


  return (
    <div className="background-image">
      <div className='w-screen'>


        <div className=" login">

          <div className="input">
            <h1 className='blue_gradient head_text '> Sign up </h1>
            <div className='logo-container'>
              <img className='logo'
                src="/logo.png"

              ></img>
            </div>
            <Input className="hel"
              type="email"
              label="Email"
              placeholder="you@example.com"
              labelPlacement="inside"
              startContent={
                <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              onChange={(event) => setUserData({ ...userData, email: event.target.value })}
              color={isInvalid ? "danger" : ""}
              errorMessage={isInvalid && "Please enter a valid email"}
            />
            <Input
              label="Password"
              className="password"
              placeholder="Enter your password"
              endContent={
                <button className="focus:outline-none " type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              onChange={(event) => setUserData({ ...userData, password: event.target.value })}

            />
            <div className="terms">


              <div onClick={handleCheckboxChange}>
                <Checkbox
                  defaultSelected
                  size="md"
                  isSelected={read}
                >
                  <Link onClick={onOpen}>I've Read The Terms and Conditions</Link>
                </Checkbox>
              </div>


            </div>
            <Modal size="lg" scrollBehavior={scrollBehavior} isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Terms and Conditions</ModalHeader>

                    <ModalBody >
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Nullam pulvinar risus non risus hendrerit venenatis.
                        Pellentesque sit amet hendrerit risus, sed porttitor quam.
                      </p>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Nullam pulvinar risus non risus hendrerit venenatis.
                        Pellentesque sit amet hendrerit risus, sed porttitor quam.
                      </p>
                      <p>
                        Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit
                        dolor adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis.
                        Velit duis sit officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
                        Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit


                      </p>
                      <Input
                        label="UserName"
                        value={userData.userName}
                        className="max-w-1/1"
                        onChange={(event) => setUserData({ ...userData, userName: event.target.value })}
                      />
                      <div>
                        <Autocomplete
                          selectedKey={userData.school}
                          defaultItems={animals}

                          className="max-w-xs"
                          onSelectionChange={setSkhool}

                          label="Select Your School"
                        >
                          {schools.map((school) => (
                            <AutocompleteItem key={school.id} value={school.id}>
                              {school.id}
                            </AutocompleteItem>
                          ))}
                        </Autocomplete>

                      </div>




                      <div className="input2-div">

                        <input className="input2" name="file" onChange={userImageUpload} type="file" />

                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" className="icon">
                          <polyline points="16 16 12 12 8 16"></polyline>
                          <line y2="21" x2="12" y1="12" x1="12"></line>
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                          <polyline points="16 16 12 12 8 16"></polyline>
                        </svg>

                      </div>
                      <div className="userCardoutside">
                        <UserCard
                          userName={userData.userName}
                          company={userData.school}
                          role={userData.role}
                          image={userData.userPicture} // Pass the user picture as a prop
                        />
                      </div>
                    </ModalBody>

                    <ModalFooter>
                      <Button color="danger" variant="light" onClick={setRead(false)} onPress={onClose}>
                        Close
                      </Button>
                      <Button color="success" onClick={setRead(true)} onPress={onClose}>
                        Accept
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>

            <div className="buttonz">
              <button className="btn google" onClick={() => read ? signInWithGoogle() : handleSignInSuccess("Read Those Terms..", "warning")}>


                <svg
                  version="1.1"
                  width="20"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 512 512"
                  style={{ enableBackground: 'new 0 0 512 512' }}
                  xmlSpace="preserve"
                >
                  <path
                    style={{ fill: '#FBBB00' }}
                    d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256    c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456    C103.821,274.792,107.225,292.797,113.47,309.408z"
                  ></path>
                  <path
                    style={{ fill: '#518EF8' }}
                    d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451    c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535    c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"
                  ></path>
                  <path
                    style={{ fill: '#28B446' }}
                    d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512    c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771    c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"
                  ></path>
                  <path
                    style={{ fill: '#F14336' }}
                    d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012    c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0    C318.115,0,375.068,22.126,419.404,58.936z"
                  ></path>
                </svg>
                Google
              </button>
              <button className="btn apple">
                <svg
                  version="1.1"
                  height="20"
                  width="20"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 22.773 22.773"
                  style={{ enableBackground: 'new 0 0 22.773 22.773' }}
                  xmlSpace="preserve"
                >
                  <g>
                    <g>
                      <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"></path>
                      <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z"></path>
                    </g>
                  </g>
                </svg>
                Apple
              </button>
            </div>
            {/* button for submit */}
            {isLoginEnabled && (
              <div className="buttons">
                <button
                  onClick={() => (read && userData.password !== "" && userData.email !== "") ? handleSignIn() : handleSignInSuccess("Read Those Terms.. & Fill them Feilds-1", "warning")}
                  className="space" type="button">
                  <strong>CREATE ACCOUNT</strong>
                  <div id="container-stars">
                    <div id="stars"></div>
                  </div>
                  <div id="glow">
                    <div className="circle"></div>
                    <div className="circle"></div>
                  </div>
                </button>
              </div>
            )}


            <Snackbar anchorOrigin={{ vertical, horizontal }}
              open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
              <Alert onClose={() => setOpenSnackbar(false)} severity={success} variant="filled" sx={{ width: '100%' }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>

          </div>
        </div>
      </div>
    </div>

  )


};






