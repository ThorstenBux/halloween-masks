export class GCALoggingService {
  db: any;
  constructor() {
    const firebase = require('firebase')
    // Imports the Google Cloud client library
    // Required for side-effects
    require('firebase/firestore')
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyC6t0LRiBa-KLesLVTXh2RWAl6DLtV1Ugk",
      authDomain: "halloween-masks.firebaseapp.com",
      databaseURL: "https://halloween-masks.firebaseio.com",
      projectId: "halloween-masks",
      storageBucket: "halloween-masks.appspot.com",
      messagingSenderId: "461651858931",
      appId: "1:461651858931:web:19c51cc922d7f46499ee86",
      measurementId: "G-TLTKE7LMR1"
    }
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig)
    this.db = firebase.firestore()
  }

  async log(event: any) {
    const userAgent = navigator.userAgent;
    event.userAgent = userAgent;
    try {
      const response = await fetch('http://www.geoplugin.net/json.gp');
      const location = await response.json();
      event.location = location
    } catch(e) {
      event.error = e
    }
    const time = Date.now()
    event.timestamp = time
    event.time = new Date(time).toString()
    this.db.collection('tracking').add({ event }).then((docRef: any) => {
      console.log('Document written with ID: ', docRef.id)
    })
  }
}