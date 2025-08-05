const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['user', 'ai', 'system'],
    default: 'user'
  },
  isAIResponse: {
    type: Boolean,
    default: false
  },
  metadata: {
    aiModel: String,
    tokens: Number,
    processingTime: Number
  }
}, {
  timestamps: true
});

// Indexes
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);