import axios from 'axios';
import { toast } from 'react-toastify';

// const baseURL = process.env.NEXT_PUBLIC_API_URL;
const baseURL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;
const API = axios.create({ baseURL });

let authToken = '';
export const setToken = (token) => {
  authToken = token;
};

API.interceptors.request.use((req) => {
  req.headers.Authorization = authToken || '';
  return req;
});

API.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    toast.error('An unexpected error occurred');
  }

  return Promise.reject(error);
});

const postsUrl = '/posts';
const categoriesUrl = '/categories';
const tagsUrl = '/tags';
const usersUrl = '/users';
// const tagPosts = '/tag';
// const categoryPosts = '/category';

export const getPosts = () => API.get(postsUrl);
export const getPost = (id: string) => API.get(`${postsUrl}/${id}`);
export const addPost = (newPost) => API.post(postsUrl, newPost);
export const updatePost = (id, post) => API.put(`${postsUrl}/${id}`, post);
export const deletePost = (id: string) => API.delete(`${postsUrl}/${id}`);

export const getUserData = () => API.get(`${usersUrl}/token`);
export const signin = (userData) => API.post(`${usersUrl}/signin`, userData);
export const signup = (userData) => API.post(`${usersUrl}/signup`, userData);
export const signout = () => API.get(`${usersUrl}/signout`);
export const changePass = (userData) =>
  API.post(`${usersUrl}/changepassword`, userData);

export const getCategories = () => API.get(categoriesUrl);
export const addCategory = (newCategory) =>
  API.post(categoriesUrl, newCategory);
export const updateCategory = (id, category) =>
  API.put(`${categoriesUrl}/${id}`, category);
export const deleteCategory = (id) => API.delete(`${categoriesUrl}/${id}`);

export const getTags = () => API.get(tagsUrl);
export const addTag = (newTag) => API.post(tagsUrl, newTag);
export const updateTag = (id, tag) => API.put(`${tagsUrl}/${id}`, tag);
export const deleteTag = (id) => API.delete(`${tagsUrl}/${id}`);
