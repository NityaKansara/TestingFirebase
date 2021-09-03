import * as firebase from "firebase"
require("@firebase/firestore")

var firebaseConfig = {
    apiKey: "AIzaSyD-W1nu67QuhoSoNj2QMSmNlafPWJ5mm7I",
    authDomain: "plip-ploop-library.firebaseapp.com",
    projectId: "plip-ploop-library",
    storageBucket: "plip-ploop-library.appspot.com",
    messagingSenderId: "314711478200",
    appId: "1:314711478200:web:8c806ae604bcee0a32094d"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();