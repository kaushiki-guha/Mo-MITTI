
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "studio-4947282261-13616",
  "appId": "1:881315807049:web:04544153fbed5dd4d3e498",
  "storageBucket": "studio-4947282261-13616.firebasestorage.app",
  "apiKey": "AIzaSyD17o59Wn8bS6S8wvq_bM1dhtHc5zA8Vx4",
  "authDomain": "studio-4947282261-13616.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "881315807049"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

export const firebaseApp = app;
