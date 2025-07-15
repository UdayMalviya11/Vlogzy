import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    maxlength: 500 
  },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment; 