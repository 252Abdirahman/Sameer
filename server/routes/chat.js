const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const ChatMessage = require('../models/ChatMessage');
const Employee = require('../models/Employee');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get chat history
router.get('/history/:room', authenticateToken, async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ room })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error while fetching chat history' });
  }
});

// Send message to AI
router.post('/ai-chat', [
  authenticateToken,
  body('message').notEmpty().trim(),
  body('room').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, room } = req.body;
    const userId = req.user.userId;

    // Save user message
    const userMessage = new ChatMessage({
      room,
      sender: userId,
      message,
      messageType: 'user'
    });
    await userMessage.save();

    // Get context for AI (recent messages + employee data if relevant)
    const recentMessages = await ChatMessage.find({ room })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    // Build context for AI
    let systemPrompt = `You are an AI assistant for the Protocol Employees System. You help with employee management, HR queries, and general workplace assistance. 
    
Current context:
- You are assisting with employee management tasks
- You can help with information about employees, departments, policies, and general HR questions
- Be professional, helpful, and concise in your responses
- If asked about specific employee data, let them know they can search the employee database through the system`;

    // Check if user is asking about employees
    if (message.toLowerCase().includes('employee') || message.toLowerCase().includes('staff')) {
      const employeeCount = await Employee.countDocuments({ status: 'active' });
      const departments = await Employee.distinct('department', { status: 'active' });
      
      systemPrompt += `\n\nCurrent system data:
- Total active employees: ${employeeCount}
- Departments: ${departments.join(', ')}`;
    }

    const conversationHistory = recentMessages.reverse().map(msg => ({
      role: msg.messageType === 'ai' ? 'assistant' : 'user',
      content: `${msg.sender?.username || 'User'}: ${msg.message}`
    }));

    const startTime = Date.now();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-8), // Last 8 messages for context
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    const processingTime = Date.now() - startTime;

    // Save AI response
    const aiMessage = new ChatMessage({
      room,
      sender: userId, // We'll use a system user ID in production
      message: aiResponse,
      messageType: 'ai',
      isAIResponse: true,
      metadata: {
        aiModel: 'gpt-3.5-turbo',
        tokens: completion.usage?.total_tokens,
        processingTime
      }
    });
    await aiMessage.save();

    res.json({
      message: 'AI response generated successfully',
      response: aiResponse,
      metadata: {
        tokens: completion.usage?.total_tokens,
        processingTime
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Handle OpenAI specific errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        message: 'AI service quota exceeded. Please try again later.' 
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({ 
        message: 'AI service configuration error.' 
      });
    }

    res.status(500).json({ 
      message: 'Server error while processing AI request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Employee search for AI context
router.get('/employee-search', authenticateToken, async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const employees = await Employee.find({
      status: 'active',
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { position: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .select('firstName lastName department position employeeId');

    res.json({ employees });
  } catch (error) {
    console.error('Employee search error:', error);
    res.status(500).json({ message: 'Server error while searching employees' });
  }
});

// Quick employee stats for AI
router.get('/quick-stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          departments: { $addToSet: '$department' },
          avgSalary: { $avg: '$salary' }
        }
      }
    ]);

    const departmentCounts = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      ...stats[0],
      departmentBreakdown: departmentCounts
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

module.exports = router;