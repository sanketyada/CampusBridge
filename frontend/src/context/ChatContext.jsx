import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../services/api';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The userId of the person we are chatting with

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);

      newSocket.emit('join', user._id);

      newSocket.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => newSocket.close();
    }
  }, [user]);

  const fetchMessages = useCallback(async (userId) => {
    try {
      const res = await api.get(`/chat/${userId}`);
      setMessages(res.data);
      setActiveChat(userId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  const sendMessage = useCallback((receiverId, content) => {
    if (socket && user) {
      socket.emit('private_message', {
        senderId: user._id,
        receiverId,
        content,
      });
    }
  }, [socket, user]);

  return (
    <ChatContext.Provider value={{ 
      socket, 
      messages, 
      activeChat, 
      setActiveChat, 
      fetchMessages, 
      sendMessage 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
