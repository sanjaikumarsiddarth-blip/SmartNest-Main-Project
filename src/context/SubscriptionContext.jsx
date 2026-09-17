import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { SELLER_PLANS, BUYER_PLANS } from '../services/subscriptionConfig';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upgrade Modal State
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    targetPlan: null,
    featureName: ''
  });

  const openUpgradeModal = ({ title, message, targetPlan, featureName }) => {
    setUpgradeModal({
      isOpen: true,
      title: title || 'Upgrade Your SmartNest Plan',
      message: message || 'Unlock premium capabilities with an upgraded plan.',
      targetPlan: targetPlan || null,
      featureName: featureName || ''
    });
  };

  const closeUpgradeModal = () => {
    setUpgradeModal((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      const [sub, usageData] = await Promise.all([
        api.getSubscription(user.user_id, user.role),
        api.getSubscriptionUsage(user.user_id, user.role)
      ]);
      setSubscription(sub);
      setUsage(usageData);
    } catch (err) {
      console.error('Error fetching subscription in context:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionData();

    const handleUpdate = () => {
      fetchSubscriptionData();
    };

    window.addEventListener('smartnest_subscription_updated', handleUpdate);
    window.addEventListener('smartnest_properties_updated', handleUpdate);
    window.addEventListener('smartnest_message_sent', handleUpdate);

    return () => {
      window.removeEventListener('smartnest_subscription_updated', handleUpdate);
      window.removeEventListener('smartnest_properties_updated', handleUpdate);
      window.removeEventListener('smartnest_message_sent', handleUpdate);
    };
  }, [fetchSubscriptionData]);

  // Entitlement Check: Can seller publish another property?
  const canCreateProperty = useCallback(() => {
    if (!user || user.role !== 'seller') return false;
    if (!usage) return true;
    return usage.properties_published < usage.property_limit;
  }, [user, usage]);

  // Entitlement Check: Can buyer contact a seller for a property?
  // If an existing conversation exists between buyer and this seller/property, contacting is always allowed.
  const canContactSeller = useCallback(async (sellerId, propertyId) => {
    if (!user || user.role !== 'buyer') return false;
    try {
      const convs = await api.getConversations(user.user_id, 'buyer');
      const hasExisting = convs.some(
        (c) => c.buyer_id === user.user_id && (c.property_id === propertyId || c.seller_id === sellerId)
      );
      if (hasExisting) return true;
    } catch (e) {}

    if (!usage) return true;
    return usage.contacts_used < usage.contact_limit;
  }, [user, usage]);

  // Entitlement Check: Feature flag
  const hasFeature = useCallback((featureKey) => {
    if (!subscription || !subscription.entitlements) return false;
    return Boolean(subscription.entitlements[featureKey]);
  }, [subscription]);

  // Subscribe / Upgrade Handler
  const subscribe = async (planId) => {
    if (!user) throw new Error('User must be logged in to subscribe.');
    const res = await api.createSubscription({
      userId: user.user_id,
      role: user.role,
      planId
    });
    await fetchSubscriptionData();
    return res;
  };

  const upgrade = async (planId) => {
    return subscribe(planId);
  };

  const cancel = async () => {
    if (!subscription) return;
    const res = await api.cancelSubscription(subscription.subscription_id);
    await fetchSubscriptionData();
    return res;
  };

  const renew = async () => {
    if (!subscription) return;
    const res = await api.renewSubscription(subscription.subscription_id);
    await fetchSubscriptionData();
    return res;
  };

  const plans = user?.role === 'seller' ? SELLER_PLANS : BUYER_PLANS;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        plans,
        loading,
        canCreateProperty,
        canContactSeller,
        hasFeature,
        subscribe,
        upgrade,
        cancel,
        renew,
        refresh: fetchSubscriptionData,
        upgradeModal,
        openUpgradeModal,
        closeUpgradeModal
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
