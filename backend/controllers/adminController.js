import userModel from '../models/userModel.js';
import postModel from '../models/postModel.js';

export const getAllUsers = (req, res) => {
  const users = userModel.getAllUsers();
  res.json(users);
};

export const getAllPosts = (req, res) => {
  const posts = postModel.getAllPosts();
  res.json(posts);
}; 