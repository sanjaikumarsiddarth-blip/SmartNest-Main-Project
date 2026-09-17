import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const MessagingContext = createContext(null);

export const MessagingProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load conversations for the current logged-in user
  const loadConversations = useCallback(async (selectedId = null) => {
    if (!user) {
      setConversations([]);
      setActiveConversation(null);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getConversations(user.user_id, user.role);
      setConversations(data || []);

      // Calculate unread count based on current user role
      const unread = (data || []).filter((c) =>
        user.role === 'buyer' ? c.unread_for_buyer : c.unread_for_seller
      ).length;
      setUnreadCount(unread);

      // Keep or update active conversation
      if (selectedId) {
        const found = (data || []).find((c) => c.conversation_id === selectedId);
        if (found) {
          setActiveConversation(found);
        }
      } else {
        setActiveConversation((prev) => {
          if (!prev) return (data && data.length > 0) ? data[0] : null;
          const stillThere = (data || []).find((c) => c.conversation_id === prev.conversation_id);
          return stillThere || ((data && data.length > 0) ? data[0] : null);
        });
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    loadConversations();
  }, [loadConversations]);

  // Select a specific conversation and mark it as read
  const selectConversation = useCallback(async (convOrId) => {
    const convId = typeof convOrId === 'string' ? convOrId : convOrId?.conversation_id;
    if (!convId) return;

    let target = conversations.find((c) => c.conversation_id === convId);
    if (!target) {
      try {
        target = await api.getConversation(convId);
      } catch (e) {
        console.error('Failed to fetch conversation detail', e);
      }
    }

    if (target) {
      setActiveConversation(target);

      // If unread for current user, mark as read immediately
      const isUnread = user?.role === 'buyer' ? target.unread_for_buyer : target.unread_for_seller;
      if (isUnread && user) {
        try {
          await api.markConversationAsRead(convId, user.user_id, user.role);
          setConversations((prev) =>
            prev.map((c) =>
              c.conversation_id === convId
                ? {
                    ...c,
                    unread_for_buyer: user.role === 'buyer' ? false : c.unread_for_buyer,
                    unread_for_seller: user.role === 'seller' ? false : c.unread_for_seller
                  }
                : c
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e) {
          console.error('Failed to mark conversation as read', e);
        }
      }
    }
  }, [conversations, user]);

  // Send message in the active or specified conversation
  const sendMessage = useCallback(async (convId, text) => {
    if (!user || !convId || !text || !text.trim()) return null;

    try {
      const result = await api.sendMessage(convId, {
        sender_id: user.user_id,
        sender_role: user.role,
        sender_name: user.name,
        text: text.trim()
      });

      if (result?.success) {
        // Refresh conversations to sync
        await loadConversations(convId);
        return result.message;
      }
      return null;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [user, loadConversations]);

  // Create or get conversation (e.g. from Property Detail "Contact Seller")
  const createOrOpenConversation = useCallback(async (params) => {
    try {
      const conv = await api.createOrGetConversation(params);
      if (conv) {
        await loadConversations(conv.conversation_id);
        setActiveConversation(conv);
      }
      return conv;
    } catch (err) {
      console.error('Failed to create/open conversation:', err);
      throw err;
    }
  }, [loadConversations]);

  // Mark conversation as read explicitly
  const markAsRead = useCallback(async (convId) => {
    if (!user || !convId) return;
    try {
      await api.markConversationAsRead(convId, user.user_id, user.role);
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === convId
            ? {
                ...c,
                unread_for_buyer: user.role === 'buyer' ? false : c.unread_for_buyer,
                unread_for_seller: user.role === 'seller' ? false : c.unread_for_seller
              }
            : c
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }, [user]);

  // Listen to cross-component and simulated real-time events
  useEffect(() => {
    const handleMessageSent = (e) => {
      const detail = e.detail;
      // If message was meant for the current user, show an in-app toast
      if (detail && detail.receiver_id === user?.user_id) {
        const sender = detail.message?.sender_name || 'Someone';
        addToast({
          type: 'info',
          message: `New message from ${sender}`,
          duration: 4000
        });
      }

      // Reload conversations and keep current selection if active
      loadConversations(activeConversation?.conversation_id);
    };

    const handleMessageRead = () => {
      loadConversations(activeConversation?.conversation_id);
    };

    window.addEventListener('smartnest_message_sent', handleMessageSent);
    window.addEventListener('smartnest_message_read', handleMessageRead);

    return () => {
      window.removeEventListener('smartnest_message_sent', handleMessageSent);
      window.removeEventListener('smartnest_message_read', handleMessageRead);
    };
  }, [user, activeConversation, loadConversations, addToast]);

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeConversation,
        unreadCount,
        loading,
        selectConversation,
        sendMessage,
        createOrOpenConversation,
        markAsRead,
        refreshConversations: loadConversations
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
