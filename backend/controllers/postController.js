import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Like from '../models/likeModel.js';
import Comment from '../models/commentModel.js';

export const createPost = async (req, res) => {
  console.log('REQ.BODY:', req.body);
  console.log('REQ.FILE:', req.file);
  const { title, content } = req.body;
  let category = req.body.category;
  if (!category || !['General', 'Web Design', 'Development', 'Database'].includes(category)) {
    category = 'General';
  }
  const image = req.file ? req.file.filename : null;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content required' });
  }
  const post = await Post.create({ title, content, category, authorId: req.user.id, image });
  res.status(201).json(post);
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('authorId', 'username');
    
    // Get like and comment counts for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id });
        
        return {
          ...post.toObject(),
          likeCount,
          commentCount
        };
      })
    );
    
    res.json(postsWithCounts);
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.user.id });
    
    // Get like and comment counts for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id });
        
        return {
          ...post.toObject(),
          likeCount,
          commentCount
        };
      })
    );
    
    res.json(postsWithCounts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const updatePost = async (req, res) => {
  const { title, content, category } = req.body;
  const image = req.file ? req.file.filename : undefined;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (req.user.role !== 'admin' && String(post.authorId) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  post.title = title;
  post.content = content;
  if (category) post.category = category;
  if (image) post.image = image;
  await post.save();
  res.json(post);
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is provided and is a valid format
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    // Check if id is a valid ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (req.user.role !== 'admin' && String(post.authorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete associated likes and comments
    await Like.deleteMany({ postId: id });
    await Comment.deleteMany({ postId: id });
    
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};    

export const getPopularPosts = async (req, res) => {
  try {
    // Aggregate posts with like counts
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likesArr'
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likesArr' }
        }
      },
      { $sort: { likeCount: -1, createdAt: -1 } }
    ]);

    // Populate authorId for each post
    const populatedPosts = await Post.populate(posts, { path: 'authorId', select: 'username' });

    // Add commentCount for each post
    const Comment = (await import('../models/commentModel.js')).default;
    const postsWithCounts = await Promise.all(
      populatedPosts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });
        return { ...post, commentCount };
      })
    );

    res.json(postsWithCounts);
  } catch (error) {
    console.error('Get popular posts error:', error);
    res.status(500).json({ message: 'Error fetching popular posts' });
  }
};    

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Post ID is required' });
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }
    const post = await Post.findById(id).populate('authorId', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const likeCount = await Like.countDocuments({ postId: post._id });
    const commentCount = await Comment.countDocuments({ postId: post._id });
    res.json({
      ...post.toObject(),
      likeCount,
      commentCount
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
};    