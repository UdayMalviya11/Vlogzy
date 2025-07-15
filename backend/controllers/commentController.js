import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';

// Create a comment
export const createComment = async (req, res) => {
  try {
    const { content, postId, parent } = req.body;
    
    if (!content || !postId) {
      return res.status(400).json({ message: 'Content and postId are required' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If parent is provided, check if parent comment exists
    let parentComment = null;
    if (parent) {
      parentComment = await Comment.findById(parent);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      content,
      authorId: req.user.id,
      postId,
      parent: parent || null
    });

    // Populate author information
    await comment.populate('authorId', 'username');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

// Get comments for a post (nested)
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.find({ postId })
      .populate('authorId', 'username')
      .sort({ createdAt: 1 });

    // Build nested comment tree
    const commentMap = {};
    comments.forEach(comment => {
      commentMap[comment._id] = { ...comment.toObject(), replies: [] };
    });
    const roots = [];
    comments.forEach(comment => {
      if (comment.parent) {
        if (commentMap[comment.parent]) {
          commentMap[comment.parent].replies.push(commentMap[comment._id]);
        }
      } else {
        roots.push(commentMap[comment._id]);
      }
    });
    res.json(roots);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Delete a comment (author or admin only)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Comment ID is required' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is admin or comment author
    if (req.user.role !== 'admin' && String(comment.authorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Get all comments (admin only)
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('authorId', 'username')
      .populate('postId', 'title')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
}; 