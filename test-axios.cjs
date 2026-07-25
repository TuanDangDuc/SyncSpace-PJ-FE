const axios = require('axios');
const FormData = require('form-data');

const api = axios.create({
  baseURL: 'http://localhost',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  console.log(config.headers);
  return config;
});

const form = new FormData();
form.append('file', 'test');

api.post('/api/image', form, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).catch(() => {});

api.post('/api/image2', form).catch(() => {});

api.post('/api/image3', form, {
  headers: { 'Content-Type': undefined }
}).catch(() => {});
