// /lib/api/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api/v1/user/register', // replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;


