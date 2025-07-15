import Like from '../models/likeModel.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

// Like a post (production-ready, using Like model only)
export const likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ message: 'PostId is required' });
    }
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Try to create a Like document
    const like = await Like.create({ userId: req.user.id, postId });
    res.status(201).json({ message: 'Post liked successfully', like });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate like
      return res.status(400).json({ message: 'Post already liked' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data' });
    }
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
};

// Unlike a post (production-ready, using Like model only)
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ message: 'PostId is required' });
    }
    const like = await Like.findOneAndDelete({ userId: req.user.id, postId });
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data' });
    }
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Error unliking post' });
  }
};

// Get like count for a post (production-ready)
export const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({ message: 'PostId is required' });
    }
    const count = await Like.countDocuments({ postId });
    res.json({ count });
  } catch (error) {
    console.error('Get like count error:', error);
    res.status(500).json({ message: 'Error getting like count' });
  }
};

// Check if user liked a post
export const checkUserLike = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const like = await Like.findOne({ 
      userId: req.user.id, 
      postId 
    });

    res.json({ liked: !!like });
  } catch (error) {
    console.error('Check user like error:', error);
    res.status(500).json({ message: 'Error checking like status' });
  }
};

// Get all likes for a post
export const getLikesByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const likes = await Like.find({ postId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json(likes);
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ message: 'Error fetching likes' });
  }
}; 

// Get all post IDs liked by a user
export const getUserLikedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }
    const likes = await Like.find({ userId }).select('postId -_id');
    const likedPostIds = likes.map(like => String(like.postId));
    res.json({ likedPostIds });
  } catch (error) {
    console.error('Get user liked posts error:', error);
    res.status(500).json({ message: 'Error fetching liked posts' });
  }
}; 