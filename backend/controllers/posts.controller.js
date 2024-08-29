const postModel = require("../models/post.model");
const categoryModel = require("../models/category.model");
const e = require("express");
const mongoose = require("mongoose");

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await postModel.findByIdAndUpdate(
      id,
      { title: title, content: content },
      { new: true }
    );
    if (!post) res.status(404).json(`Post with id:${id} doesnot exists`);
    else {
      const posts = await postModel.findById(id);

      res.status(200).json(posts);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

async function allPosts(req, res) {
  try {
    const posts = await postModel.find();
    res.send(posts);
  } catch (err) {
    console.log(err);
  }
}

async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const posts = await postModel.findById(id);
    res.send(posts);
  } catch (err) {
    console.log(err);
  }
}
async function createPost(req, res) {
  try {
    const posts = await postModel.create({
      userId: req.id,
      title: req.body.title,
      content: req.body.content,
      createdAt: req.body.createdAt,
      category: req.body.category,
      tags: req.body.tags,
    });
    categ = posts.category;
    const categories = await categoryModel.findOne({ name: categ });
    console.log(categories);
    if (categories) {
      categories.post.push(posts);
      categories.save();
    } else {
      const newCategories = await categoryModel.create({ name: categ });
      newCategories.post.push(posts);
      newCategories.save();
    }
    res.send(posts);
  } catch (err) {
    console.log(err);
  }
}


async function increaseLikes(req, res) {
  try {
    console.log("came into increase Likes");
      const { id } = req.params;
      const { username } = req.body; 
      
      const post = await postModel.findById(id);
      
      if (!post) {
        return res.status(400).send(`Post with id:${id} does not exist`);
      }
      
      if (post.likedBy.includes(username)) {
        return res.status(400).send("User has already liked this post");
      }
      
      post.likes += 1;
      post.likedBy.push(username);
      console.log(post);
      
      await post.save();
      
      res.status(200).send(post);
  } catch (err) {
      res.status(400).send(err.message);
  }
}


async function decreaseLikes(req, res) {
  try {
    console.log("came into decreaseLikes");
    
      const { id } = req.params;
      const { username } = req.body; 
      
      const post = await postModel.findById(id);
      
      if (!post) {
          return res.status(400).send(`Post with id:${id} does not exist`);
      }
      
      if (!post.likedBy.includes(username)) {
          return res.status(400).send("User has not liked this post");
      }
      
      post.likes -= 1;
      if(post.likes<0){
        post.likes = 0;
      }
      post.likedBy = post.likedBy.filter(user => user !== username);
      
      await post.save();
      
      res.status(200).send(post);
  } catch (err) {
    console.log("came into error section");
    
      res.status(400).send(err.message);
  }
}



async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const post = await postModel.findByIdAndDelete(id);
    if (!post) res.status(404).send(`Post with id:${id} does not exists`);
    else res.status(200).send(`Post with id:${id} is deleted`);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

async function getPostByUserId(req, res) {
  try {
    const { userId } = req.params;
    const posts = await postModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });
    const totalLikes = posts.reduce((count, post) => count + post.likes, 0);

    if (!posts) res.status(404).send(`Post with id:${id} does not exists`);
    else
      res
        .status(200)
        .json({ myposts: posts, posts: posts.length, likes: totalLikes });
  } catch (error) {
    res.status(500).json(error.message);
  }
}
methods = {
  createPost,
  deletePost,
  updatePost,
  allPosts,
  getPostById,
  increaseLikes,
  decreaseLikes,
  getPostByUserId,
};
module.exports = methods;
