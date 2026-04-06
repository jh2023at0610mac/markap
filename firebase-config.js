export const firebaseConfig = {
  apiKey: "AIzaSyBtXz1Bx_IUExLr8SWz1tcbdObq0OAjyG4",
  authDomain: "markap-98f77.firebaseapp.com",
  projectId: "markap-98f77",
  storageBucket: "markap-98f77.firebasestorage.app",
  messagingSenderId: "574542573303",
  appId: "1:574542573303:web:eb49b33b0129988140adf2"
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some((value) =>
  value.startsWith("REPLACE_WITH_")
);
