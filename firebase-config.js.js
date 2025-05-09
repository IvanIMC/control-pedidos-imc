// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5_S9yArf_lo6ciFx6t_G_w4XnEKJ0doU",
  authDomain: "control-pedidos-imc-e940a.firebaseapp.com",
  projectId: "control-pedidos-imc-e940a",
  storageBucket: "control-pedidos-imc-e940a.appspot.com",
  messagingSenderId: "428652101735",
  appId: "1:428652101735:web:97431b0f281f760c2294c2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
