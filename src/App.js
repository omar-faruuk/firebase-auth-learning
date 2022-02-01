import logo from './logo.svg';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, FacebookAuthProvider } from "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

const firebaseApp = initializeApp(firebaseConfig);



function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    succes: false
  })
  const provider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();

  const auth = getAuth();
  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(res => {
        const { displayName, email, photoURL } = res.user;
        const signedIn = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedIn)
        console.log(displayName, email, photoURL);
      })
      .catch(err => {
        console.log(err.message);
      })
  }
  const handleSignOut = () => {
    signOut(auth)
      .then(res => {
        const signedOut = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: ''
        }
        setUser(signedOut)
      })
      .catch(err => {
        console.log(err.message);
      })
  }
  const signInWithFb = () => {
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        // The signed-in user info.
        const userInfo = result.user;
        console.log(userInfo);

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // const credential = FacebookAuthProvider.credentialFromResult(result);
        // const accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);

        // ...
        console.log(errorMessage);
      });

  }
  const handleBlur = (event) => {
    let isFormValid = true;
    if (event.target.name === 'email') {
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && passwordHasNumber;
    }
    if (isFormValid) {
      const newUser = { ...user };
      newUser[event.target.name] = event.target.value;
      setUser(newUser)
    }

  }
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.succes = true;
          setUser(newUserInfo)
          updateUserName(user.name)

        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.code;
          newUserInfo.succes = false;
          setUser(newUserInfo);
          console.log(error.message, error.code);
        });
    }
    if (!newUser && user.email && user.password) {
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.succes = true;
          setUser(newUserInfo)
          console.log(res.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.code;
          newUserInfo.succes = false;
          setUser(newUserInfo);
          console.log(error.message, error.code);
        });
    }
    e.preventDefault()
  }
  const updateUserName = name => {
    updateProfile(auth.currentUser, {
      displayName: name,
    })
      .then(res => {
        console.log('updated name succesflly');

      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> : <button onClick={handleSignIn}>Sign in</button>
      }
      <br />
      <button onClick={signInWithFb}>sign in with facebook</button>
      {user.isSignedIn && <div>
        <p>welcome {user.name}</p>
        email: {user.email}
        <img src={user.photo} alt="" />
      </div>
      }
      <h1>Our authentication</h1>
      <input onChange={() => setNewUser(!newUser)} type="checkbox" name="newUser" id="user" />
      <label HtmlFor="newUser">new user sign up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input onBlur={handleBlur} type="text" name='name' />}
        <br />
        <input onBlur={handleBlur} type="text" placeholder='enter email' name='email' required />
        <br />
        <input onBlur={handleBlur} type="password" name="password" id="" placeholder='password' required />
        <br />
        <input type="submit" value={newUser ? 'sign up' : 'log in'} />
        <p style={{ color: 'red' }}>{user.error}</p>
        {user.succes && <p style={{ color: 'green' }}>succesfuly {newUser ? 'created' : 'loged in'} account</p>}
      </form>
    </div>
  );
}

export default App;
