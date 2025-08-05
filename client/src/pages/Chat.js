import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const MessageBubble = ({ message, isAI, timestamp, isLoading = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Box
      display="flex"
      justifyContent={isAI ? 'flex-start' : 'flex-end'}
      mb={2}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        maxWidth="70%"
        flexDirection={isAI ? 'row' : 'row-reverse'}
      >
        <Avatar
          sx={{
            bgcolor: isAI ? 'secondary.main' : 'primary.main',
            mx: 1,
            width: 32,
            height: 32,
          }}
        >
          {isAI ? <AIIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isAI ? 'grey.100' : 'primary.main',
            color: isAI ? 'text.primary' : 'white',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          {isLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <LoadingSpinner size={16} color={isAI ? 'primary' : 'inherit'} />
              <Typography variant="body2">AI is thinking...</Typography>
            </Box>
          ) : (
            <Typography variant="body1">{message}</Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              opacity: 0.7,
              fontSize: '0.75rem',
            }}
          >
            {timestamp}
          </Typography>
        </Paper>
      </Box>
    </Box>
  </motion.div>
);

const SuggestedQuestions = ({ onQuestionClick, disabled }) => {
  const suggestions = [
    "How many employees do we have?",
    "Show me department statistics",
    "What are the company policies?",
    "Help me with HR procedures",
    "Generate employee report",
    "What's our turnover rate?",
  ];

  return (
    <Box mb={2}>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Suggested questions:
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {suggestions.map((question, index) => (
          <Chip
            key={index}
            label={question}
            variant="outlined"
            size="small"
            onClick={() => !disabled && onQuestionClick(question)}
            sx={{
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              '&:hover': {
                backgroundColor: disabled ? 'transparent' : 'action.hover',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hello! I'm your AI assistant for the Protocol Employees System. How can I help you today?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      message: newMessage,
      isAI: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      message: '',
      isAI: true,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await axios.post('/chat/ai-chat', {
        message: newMessage,
        room: 'general', // You can implement different chat rooms
      });

      const aiMessage = {
        id: Date.now() + 2,
        message: response.data.response,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Remove loading message and add AI response
      setMessages(prev => [...prev.slice(0, -1), aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 2,
        message: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setNewMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        message: "Hello! I'm your AI assistant for the Protocol Employees System. How can I help you today?",
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            AI Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chat with our AI to get help with employee management and HR tasks.
          </Typography>
        </Box>
        <IconButton onClick={clearChat} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Card sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              mb: 2,
              pr: 1,
              maxHeight: 'calc(100vh - 400px)',
            }}
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.message}
                  isAI={msg.isAI}
                  timestamp={msg.timestamp}
                  isLoading={msg.isLoading}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Suggested Questions */}
          <SuggestedQuestions
            onQuestionClick={handleSuggestedQuestion}
            disabled={isLoading}
          />

          {/* Input Area */}
          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              variant="outlined"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)',
                },
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Chat Info */}
      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          💡 You can ask me about employee statistics, department information, company policies, or any HR-related questions.
        </Typography>
      </Box>
    </Box>
  );
};

export default Chat;