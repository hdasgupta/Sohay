import axios from 'axios';
import { uiEvents } from './uiEvents.js';
import { auth } from './auth.js';
const api=axios.create({baseURL:import.meta.env.VITE_BACKEND_URL||'http://localhost:10000/api',timeout:30000});
let activeRequests=0;
const stopLoading=()=>{activeRequests=Math.max(0,activeRequests-1);if(activeRequests===0)uiEvents.emit('loading',false)};
api.interceptors.request.use(config=>{config.headers.Authorization=auth.token()?`Bearer ${auth.token()}`:undefined; activeRequests+=1; uiEvents.emit('loading',true); console.log('[api] request',config.method,config.url); return config;});
api.interceptors.response.use(response=>{stopLoading();console.log('[api] success',response.config.url);return response;},error=>{stopLoading();console.error('[api] error',error.response?.data||error.message); if(error.response?.status===401){auth.clear();if(location.pathname!=='/login')window.location.assign('/login');} return Promise.reject(error);});
export default api;
