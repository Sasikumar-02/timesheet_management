import axios from 'axios';

const apik = axios.create({
  baseURL: process.env.REACT_APP_API_KEY,
 
});

apik.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apik;
