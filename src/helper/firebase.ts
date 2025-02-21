// firebase.js
export const admin = require('firebase-admin');
import serviceAccount from "./serviceAccountKey.json"
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


