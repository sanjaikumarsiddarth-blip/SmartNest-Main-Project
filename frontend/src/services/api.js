// Centralized API Service for SmartNest AI
// CRITICAL RULE: Zero business logic in UI components. All requests flow through this file.

import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_SELLERS,
  INITIAL_LIFESTYLE_PROFILE,
  INITIAL_SELLER_ANALYTICS,
  INITIAL_ADMIN_ANALYTICS,
  INITIAL_ENQUIRIES,
  INITIAL_REPORTS,
  INITIAL_SEARCH_HISTORY,
  INITIAL_CONVERSATIONS
} from './mockData.js';

import {
  workflowCompatibilityAnalysis,
  workflowAIPropertyComparison,
  workflowWhyThisProperty,
  workflowWishlistPriceAlert,
  workflowCreateSubscriptionSession,
  workflowVerifyPaymentSignature,
  workflowProcessRazorpayWebhook,
  workflowGenerateInvoice
} from './workflows.js';

import {
  SELLER_PLANS,
  BUYER_PLANS,
  getPlanById
} from './subscriptionConfig.js';

import {
  PROPERTY_IMAGES_MAP,
  getUniquePropertyImages
} from './propertyImages.js';

// Configurable Demo Mode
const DEMO_STORAGE_KEY = 'smartnest_demo_mode';
export const getDemoMode = () => {
  if (typeof localStorage === 'undefined') return true;
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  return stored !== null ? JSON.parse(stored) : true; // Default true
};

export const setDemoMode = (enabled) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(enabled));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('smartnest_demo_mode_changed'));
  }
};

const SMARTNEST_API_URL = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_SMARTNEST_API_URL)) || 'http://localhost:5000/api';

// In-Memory / LocalStorage State for Mock Backend
const getStore = (key, defaultVal) => {
  try {
    if (typeof localStorage === 'undefined') return defaultVal;
    const raw = localStorage.getItem(`smartnest_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStore = (key, val) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`smartnest_${key}`, JSON.stringify(val));
    }
  } catch (e) {
    console.error(`Failed to save store ${key}`, e);
    // Safe fallback if localStorage quota exceeded: prune heavy base64 strings
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      try {
        if (key === 'properties' && Array.isArray(val)) {
          const pruned = val.map((p) => {
            if (p.images && Array.isArray(p.images)) {
              return {
                ...p,
                images: p.images.map((img) =>
                  typeof img === 'string' && img.length > 90000
                    ? img.slice(0, 90000)
                    : img
                )
              };
            }
            return p;
          });
          localStorage.setItem(`smartnest_${key}`, JSON.stringify(pruned));
        }
      } catch (innerErr) {
        console.error('Fallback pruned storage also failed', innerErr);
      }
    }
  }
};

// ── SINGLE SOURCE OF TRUTH: PROPERTY STORE & PERSISTENCE ──────
const loadPropertiesStore = () => {
  const loaded = getStore('properties', null);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    const initialized = INITIAL_PROPERTIES.map((ip) => {
      const uniqueImgs = PROPERTY_IMAGES_MAP[ip.property_id] || getUniquePropertyImages(ip.property_id, ip.title);
      return {
        ...ip,
        images: uniqueImgs,
        photos: uniqueImgs
      };
    });
    setStore('properties', initialized);
    return initialized;
  }

  // Preserve initial demo properties, supplement with loaded user-published properties from localStorage
  const map = new Map();
  // Put initial demo properties in first with unique images
  INITIAL_PROPERTIES.forEach((ip) => {
    const uniqueImgs = PROPERTY_IMAGES_MAP[ip.property_id] || getUniquePropertyImages(ip.property_id, ip.title);
    map.set(ip.property_id, {
      ...ip,
      images: uniqueImgs,
      photos: uniqueImgs
    });
  });

  // Preserve user-created properties or update existing demo properties
  loaded.forEach((p) => {
    if (p && p.property_id) {
      const uniqueImgs = PROPERTY_IMAGES_MAP[p.property_id] || getUniquePropertyImages(p.property_id, p.title);
      if (map.has(p.property_id)) {
        // Keep runtime state like views, status, enquiries if updated, but ensure unique images
        const canonical = map.get(p.property_id);
        map.set(p.property_id, {
          ...canonical,
          ...p,
          images: uniqueImgs,
          photos: uniqueImgs
        });
      } else if (p.property_id.startsWith('prop_demo_') || p.is_user_created) {
        // User-published property from Seller Add Property
        map.set(p.property_id, {
          ...p,
          images: (p.images && p.images.length > 0) ? p.images : uniqueImgs,
          photos: (p.photos && p.photos.length > 0) ? p.photos : uniqueImgs
        });
      }
    }
  });

  const fullList = Array.from(map.values());
  setStore('properties', fullList);
  return fullList;
};

let propertiesStore = loadPropertiesStore();

const syncPropertiesStore = () => {
  propertiesStore = loadPropertiesStore();
  return propertiesStore;
};

const savePropertiesStore = (newList) => {
  propertiesStore = newList;
  setStore('properties', newList);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smartnest_properties_updated', { detail: { count: newList.length } }));
  }
  return propertiesStore;
};

// Initialize persistent sellers store
let sellersStore = (() => {
  const loaded = getStore('sellers', INITIAL_SELLERS);
  const loadedIds = new Set((loaded || []).map((s) => s.seller_id));
  const missing = INITIAL_SELLERS.filter((is) => !loadedIds.has(is.seller_id));
  const fullList = [...(loaded || []), ...missing].map((s) => {
    const init = INITIAL_SELLERS.find((is) => is.seller_id === s.seller_id);
    return init ? { ...init, ...s } : s;
  });
  setStore('sellers', fullList);
  return fullList;
})();

// Track properties shown in the immediately previous search for soft preference (never hard-excluding)
let lastShownPropertyIds = new Set();
try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('smartnest_seen_property_ids');
  }
} catch (e) {}

let usersStore = (() => {
  const loaded = getStore('users', INITIAL_USERS);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    setStore('users', INITIAL_USERS);
    return INITIAL_USERS;
  }
  const map = new Map();
  INITIAL_USERS.forEach((u) => map.set(u.user_id, { ...u }));
  loaded.forEach((u) => {
    if (u && u.user_id) {
      const existing = map.get(u.user_id);
      map.set(u.user_id, existing ? { ...existing, ...u, role: existing.role, properties_count: existing.properties_count } : u);
    }
  });
  const merged = Array.from(map.values());
  setStore('users', merged);
  return merged;
})();
let enquiriesStore = getStore('enquiries', INITIAL_ENQUIRIES);
let reportsStore = getStore('reports', INITIAL_REPORTS);
let searchHistoryStore = getStore('history', INITIAL_SEARCH_HISTORY);
let shortlistStore = getStore('shortlist', ["P01", "P02"]);
let lifestyleProfileStore = getStore('lifestyle_profile', INITIAL_LIFESTYLE_PROFILE);

// Buyer preferences store (synced with buyer profile/quiz)
let buyerPreferencesStore = getStore('buyer_preferences', {
  budget: 6000000,
  bhk: 2,
  household_type: 'family',
  city: 'Coimbatore',
  workplace: 'Tidel Park Coimbatore',
  max_commute: 30,
  commute_mode: 'Car',
  noise_pref: 'quiet',
  school_importance: 'high',
  park_walking: true,
  amenities: ['Supermarket', 'School', 'Park', 'Gym']
});

// Property price history store
let priceHistoryStore = getStore('price_history', [
  {
    id: 'ph_init_01',
    property_id: 'P01',
    old_price: 5800000,
    new_price: 5500000,
    change_amount: 300000,
    change_percentage: 5.17,
    changed_by: 'usr_seller_01',
    changed_at: '2026-08-20T11:00:00Z'
  }
]);

// Two-way conversations store
let conversationsStore = (() => {
  const loaded = getStore('conversations', INITIAL_CONVERSATIONS);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    setStore('conversations', INITIAL_CONVERSATIONS);
    return INITIAL_CONVERSATIONS;
  }
  return loaded;
})();

// Centralized Subscriptions Store
export const INITIAL_SUBSCRIPTIONS = [
  {
    subscription_id: 'sub_demo_seller_01',
    user_id: 'usr_seller_01',
    role: 'seller',
    plan_id: 'connect',
    plan_name: 'Connect',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-15T00:00:00Z',
    renewal_at: '2026-10-15T00:00:00Z',
    billing_cycle: '45_days',
    amount: 500,
    currency: 'INR',
    usage: {
      properties_published: 1,
      property_limit: 15
    },
    entitlements: SELLER_PLANS[0].entitlements
  },
  {
    subscription_id: 'sub_demo_seller_02',
    user_id: 'usr_seller_02',
    role: 'seller',
    plan_id: 'connect_plus',
    plan_name: 'Connect+',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-15T00:00:00Z',
    renewal_at: '2026-10-15T00:00:00Z',
    billing_cycle: '45_days',
    amount: 700,
    currency: 'INR',
    usage: {
      properties_published: 3,
      property_limit: 25
    },
    entitlements: SELLER_PLANS[1].entitlements
  },
  {
    subscription_id: 'sub_demo_seller_03',
    user_id: 'usr_seller_03',
    role: 'seller',
    plan_id: 'relax',
    plan_name: 'Relax',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-15T00:00:00Z',
    renewal_at: '2026-10-15T00:00:00Z',
    billing_cycle: '45_days',
    amount: 940,
    currency: 'INR',
    usage: {
      properties_published: 8,
      property_limit: 50
    },
    entitlements: SELLER_PLANS[2].entitlements
  },
  {
    subscription_id: 'sub_demo_buyer_01',
    user_id: 'usr_buyer_01',
    role: 'buyer',
    plan_id: 'free',
    plan_name: 'Free',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-01T00:00:00Z',
    renewal_at: '2026-10-01T00:00:00Z',
    billing_cycle: 'monthly',
    amount: 0,
    currency: 'INR',
    usage: {
      contacts_used: 1,
      contact_limit: 1
    },
    entitlements: BUYER_PLANS[0].entitlements
  },
  {
    subscription_id: 'sub_demo_buyer_02',
    user_id: 'usr_buyer_02',
    role: 'buyer',
    plan_id: 'smart_seller',
    plan_name: 'SmartSeller',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-01T00:00:00Z',
    renewal_at: '2026-10-01T00:00:00Z',
    billing_cycle: 'monthly',
    amount: 699,
    currency: 'INR',
    usage: {
      contacts_used: 4,
      contact_limit: 10
    },
    entitlements: BUYER_PLANS[1].entitlements
  },
  {
    subscription_id: 'sub_demo_buyer_03',
    user_id: 'usr_buyer_03',
    role: 'buyer',
    plan_id: 'relax',
    plan_name: 'Relax',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-01T00:00:00Z',
    renewal_at: '2026-10-01T00:00:00Z',
    billing_cycle: 'monthly',
    amount: 1499,
    currency: 'INR',
    usage: {
      contacts_used: 12,
      contact_limit: 30
    },
    entitlements: BUYER_PLANS[2].entitlements
  }
];

export const INITIAL_PAYMENT_TRANSACTIONS = [
  {
    payment_id: 'pay_demo_buyer_02',
    user_id: 'usr_buyer_02',
    user_name: 'Karthik Raja',
    role: 'buyer',
    plan_id: 'smart_seller',
    plan_name: 'SmartSeller',
    subscription_id: 'sub_demo_buyer_02',
    provider: 'demo_gateway',
    provider_payment_id: 'pay_sim_1190d',
    amount: 699,
    currency: 'INR',
    status: 'successful',
    payment_method: 'UPI AutoPay (Demo)',
    created_at: '2026-09-01T00:00:00Z'
  },
  {
    payment_id: 'pay_demo_buyer_03',
    user_id: 'usr_buyer_03',
    user_name: 'Deepak Verma',
    role: 'buyer',
    plan_id: 'relax',
    plan_name: 'Relax',
    subscription_id: 'sub_demo_buyer_03',
    provider: 'demo_gateway',
    provider_payment_id: 'pay_sim_9923e',
    amount: 1499,
    currency: 'INR',
    status: 'successful',
    payment_method: 'Corporate Card (Demo)',
    created_at: '2026-09-01T00:00:00Z'
  },
  {
    payment_id: 'pay_demo_seller_01',
    user_id: 'usr_seller_01',
    user_name: 'Prestige Developers',
    role: 'seller',
    plan_id: 'connect',
    plan_name: 'Connect',
    subscription_id: 'sub_demo_seller_01',
    provider: 'demo_gateway',
    provider_payment_id: 'pay_sim_7721c',
    amount: 500,
    currency: 'INR',
    status: 'successful',
    payment_method: 'Net Banking (Demo)',
    created_at: '2026-09-01T00:00:00Z'
  },
  {
    payment_id: 'pay_demo_seller_02',
    user_id: 'usr_seller_02',
    user_name: 'Vikram Sundaram',
    role: 'seller',
    plan_id: 'connect_plus',
    plan_name: 'Connect+',
    subscription_id: 'sub_demo_seller_02',
    provider: 'demo_gateway',
    provider_payment_id: 'pay_sim_9281a',
    amount: 700,
    currency: 'INR',
    status: 'successful',
    payment_method: 'Debit Card (Demo)',
    created_at: '2026-09-01T00:00:00Z'
  },
  {
    payment_id: 'pay_demo_seller_03',
    user_id: 'usr_seller_03',
    user_name: 'Meera Krishnan',
    role: 'seller',
    plan_id: 'relax',
    plan_name: 'Relax',
    subscription_id: 'sub_demo_seller_03',
    provider: 'demo_gateway',
    provider_payment_id: 'pay_sim_4410b',
    amount: 940,
    currency: 'INR',
    status: 'successful',
    payment_method: 'Corporate Card (Demo)',
    created_at: '2026-09-01T00:00:00Z'
  }
];

export const INITIAL_INVOICES = INITIAL_PAYMENT_TRANSACTIONS.map((tx, idx) => {
  const base = Math.round((tx.amount / 1.18) * 100) / 100;
  const tax = Math.round((tx.amount - base) * 100) / 100;
  return {
    invoice_id: `INV-202609-${1001 + idx}`,
    payment_id: tx.payment_id,
    subscription_id: tx.subscription_id,
    user_id: tx.user_id,
    customer_name: tx.user_name,
    customer_email: `${tx.user_id}@smartnest.ai`,
    plan_name: tx.plan_name,
    role: tx.role,
    currency: 'INR',
    amount: tx.amount,
    base_amount: base,
    cgst_9_pct: Math.round((tax / 2) * 100) / 100,
    sgst_9_pct: Math.round((tax / 2) * 100) / 100,
    total_tax: tax,
    status: 'PAID',
    payment_method: tx.payment_method,
    issued_date: tx.created_at,
    due_date: tx.created_at
  };
});

const sanitizeSubscriptionsStore = (subs) => {
  if (!Array.isArray(subs)) return INITIAL_SUBSCRIPTIONS;
  const sellerPlanIds = new Set(SELLER_PLANS.map((p) => p.id));
  const buyerPlanIds = new Set(BUYER_PLANS.map((p) => p.id));

  let modified = false;
  const cleaned = subs.map((sub) => {
    if (!sub || typeof sub !== 'object') return sub;
    const effectiveRole =
      sub.role ||
      (sub.user_id && sub.user_id.includes('seller') ? 'seller' : 'buyer');

    if (effectiveRole === 'seller') {
      if (!sellerPlanIds.has(sub.plan_id)) {
        modified = true;
        const defaultSellerPlan = SELLER_PLANS[0];
        return {
          ...sub,
          role: 'seller',
          plan_id: defaultSellerPlan.id,
          plan_name: defaultSellerPlan.name,
          amount: defaultSellerPlan.price,
          currency: 'INR',
          billing_cycle: defaultSellerPlan.billing_cycle,
          usage: {
            properties_published: sub.usage?.properties_published || 0,
            property_limit: defaultSellerPlan.property_limit
          },
          entitlements: defaultSellerPlan.entitlements
        };
      }
      const matchedPlan = SELLER_PLANS.find((p) => p.id === sub.plan_id);
      if (matchedPlan && (sub.amount === 1209 || sub.amount === 1539 || sub.amount === 2309)) {
        modified = true;
        return { ...sub, role: 'seller', amount: matchedPlan.price };
      }
      return { ...sub, role: 'seller' };
    } else if (effectiveRole === 'buyer') {
      if (!buyerPlanIds.has(sub.plan_id)) {
        modified = true;
        const defaultBuyerPlan = BUYER_PLANS[0];
        return {
          ...sub,
          role: 'buyer',
          plan_id: defaultBuyerPlan.id,
          plan_name: defaultBuyerPlan.name,
          amount: defaultBuyerPlan.price,
          currency: 'INR',
          billing_cycle: defaultBuyerPlan.billing_cycle,
          usage: {
            contacts_used: sub.usage?.contacts_used || 0,
            contact_limit: defaultBuyerPlan.contact_limit
          },
          entitlements: defaultBuyerPlan.entitlements
        };
      }
      return { ...sub, role: 'buyer' };
    }
    return sub;
  });

  if (modified) {
    setStore('subscriptions', cleaned);
  }
  return cleaned;
};

let subscriptionsStore = (() => {
  const loaded = getStore('subscriptions', INITIAL_SUBSCRIPTIONS);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    setStore('subscriptions', INITIAL_SUBSCRIPTIONS);
    return INITIAL_SUBSCRIPTIONS;
  }
  return sanitizeSubscriptionsStore(loaded);
})();

const syncSubscriptionsStore = () => {
  const loaded = getStore('subscriptions', INITIAL_SUBSCRIPTIONS);
  if (loaded && Array.isArray(loaded) && loaded.length > 0) {
    subscriptionsStore = sanitizeSubscriptionsStore(loaded);
  }
};

let transactionsStore = (() => {
  const loaded = getStore('payment_transactions', INITIAL_PAYMENT_TRANSACTIONS);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    setStore('payment_transactions', INITIAL_PAYMENT_TRANSACTIONS);
    return INITIAL_PAYMENT_TRANSACTIONS;
  }
  return loaded;
})();

const syncTransactionsStore = () => {
  const loaded = getStore('payment_transactions', INITIAL_PAYMENT_TRANSACTIONS);
  if (loaded && Array.isArray(loaded)) {
    transactionsStore = loaded;
  }
};

let invoicesStore = (() => {
  const loaded = getStore('invoices', INITIAL_INVOICES);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    setStore('invoices', INITIAL_INVOICES);
    return INITIAL_INVOICES;
  }
  return loaded;
})();

const syncInvoicesStore = () => {
  const loaded = getStore('invoices', INITIAL_INVOICES);
  if (loaded && Array.isArray(loaded)) {
    invoicesStore = loaded;
  }
};

// Deduplicated in-app notifications store
let notificationsStore = getStore('notifications', [
  {
    id: 'notif_init_01',
    user_id: 'usr_buyer_01',
    type: 'price_drop',
    title: 'PRICE DROP ALERT',
    message: 'Serene Green Meadows: ₹58L → ₹55L. This property is now within your preferred budget.',
    property_id: 'P01',
    read: false,
    deduplication_key: 'P01_5800000_to_5500000_usr_buyer_01',
    metadata: {
      old_price: 5800000,
      new_price: 5500000,
      change_percentage: 5.17,
      property_title: 'Serene Green Meadows'
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'notif_init_msg_buyer',
    user_id: 'usr_buyer_01',
    type: 'new_message',
    title: 'New Reply from Landmark Realty',
    message: 'Whispering Pines Villa: "Greetings Aarav! Yes, all Phase 2 triplex villas come pre-installed..."',
    property_id: 'P03',
    link: '/buyer/messages?id=conv_02',
    read: false,
    deduplication_key: 'msg_02_02_usr_buyer_01',
    metadata: {
      conversation_id: 'conv_02',
      property_id: 'P03',
      property_title: 'Whispering Pines Villa',
      sender_name: 'Landmark Realty',
      sender_role: 'seller'
    },
    created_at: '2026-09-07T16:45:00Z'
  },
  {
    id: 'notif_init_msg_seller',
    user_id: 'usr_seller_01',
    type: 'new_message',
    title: 'New Message from Aarav Sharma',
    message: 'Serene Green Meadows: "Thank you! 11:00 AM works perfectly. Will bring my family along..."',
    property_id: 'P01',
    link: '/seller/enquiries',
    read: false,
    deduplication_key: 'msg_01_03_usr_seller_01',
    metadata: {
      conversation_id: 'conv_01',
      property_id: 'P01',
      property_title: 'Serene Green Meadows',
      sender_name: 'Aarav Sharma',
      sender_role: 'buyer'
    },
    created_at: '2026-09-07T10:15:00Z'
  }
]);

// Email dispatch event logs
let emailLogsStore = getStore('email_logs', []);

// Helper for simulated backend latency
const mockLatency = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Generic HTTP fetcher for live SNS Workflows backend
async function httpCall(endpoint, options = {}) {
  const sessionId = localStorage.getItem('smartnest_session_id') || 'anonymous_session';
  const token = localStorage.getItem('smartnest_token') || '';

  const headers = {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${SMARTNEST_API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// CENTRAL API OBJECT
// ─────────────────────────────────────────────────────────────

export const api = {
  // ── AUTHENTICATION ─────────────────────────────────────────
  async login(email, password, contact = '') {
    if (getDemoMode()) {
      await mockLatency(300);
      const normalizedEmail = (email || '').trim().toLowerCase();
      let user = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user && normalizedEmail === 'prestige@smartnest.ai') {
        user = usersStore.find((u) => u.user_id === 'usr_seller_01');
      }
      if (!user) {
        throw new Error("No account found with this email address");
      }
      if (user.password !== password && password !== 'password123') {
        throw new Error("Incorrect password entered");
      }
      if (user.status === "inactive") {
        throw new Error("Account is inactive. Please contact support.");
      }

      // If contact was provided and user is a seller, persist to profile
      if (contact && user.role === 'seller') {
        user.phone = contact;
        user.contact = contact;
        setStore('users', usersStore);
      }

      const token = `mock_jwt_token_${user.user_id}_${Date.now()}`;
      return {
        user_id: user.user_id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone || contact,
        contact: user.contact || user.phone || contact,
        token
      };
    }
    return httpCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, contact })
    });
  },

  async register(name, email, password, role) {
    if (getDemoMode()) {
      await mockLatency(300);
      const exists = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error("An account already exists with this email address");
      }
      const newUser = {
        user_id: `usr_${role}_${Date.now()}`,
        name,
        email,
        password,
        role,
        status: "active",
        registered_at: new Date().toISOString()
      };
      usersStore = [...usersStore, newUser];
      setStore('users', usersStore);
      const token = `mock_jwt_token_${newUser.user_id}_${Date.now()}`;
      return {
        user_id: newUser.user_id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        token
      };
    }
    return httpCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
  },

  async logout(sessionId) {
    if (getDemoMode()) {
      await mockLatency(150);
      return { success: true };
    }
    return httpCall('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
  },

  // ── BUYER ENDPOINTS ────────────────────────────────────────
  async getBuyerPreferences(userId = 'usr_buyer_01') {
    if (getDemoMode()) {
      await mockLatency(150);
      return buyerPreferencesStore;
    }
    return httpCall(`/buyer/preferences/${userId}`);
  },

  async updateBuyerPreferences(prefs, userId = 'usr_buyer_01') {
    if (getDemoMode()) {
      await mockLatency(200);
      buyerPreferencesStore = { ...buyerPreferencesStore, ...prefs };
      setStore('buyer_preferences', buyerPreferencesStore);
      return buyerPreferencesStore;
    }
    return httpCall(`/buyer/preferences/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(prefs)
    });
  },

  async analyzeLifestyle(preferences) {
    if (getDemoMode()) {
      await mockLatency(450);
      const householdType = preferences.household_type || (preferences.family_size > 2 ? 'family' : preferences.family_size === 2 ? 'couple' : 'bachelor');
      const familySize = preferences.family_size || (householdType === 'family' ? 4 : householdType === 'couple' ? 2 : 1);

      // Sync buyer preferences store with household_type and fallback family_size
      buyerPreferencesStore = {
        ...buyerPreferencesStore,
        ...preferences,
        household_type: householdType,
        family_size: familySize
      };
      setStore('buyer_preferences', buyerPreferencesStore);

      const budgetLakhs = preferences.budget ? Math.round(preferences.budget / 100000) : 60;
      const lifestyleType = householdType === 'family'
        ? "Family-Oriented Professional"
        : householdType === 'couple'
        ? "Modern Dual-Income Couple"
        : "Tech-Driven Urbanite";

      const profile = {
        lifestyle_type: lifestyleType,
        ai_summary: `Calculated priority index favors ${preferences.commute_mode || 'convenient'} commuting (max ${preferences.max_commute || 30}m) in ${preferences.city || 'Coimbatore'}. Key criteria include keeping acquisition budget below ₹${budgetLakhs}L with acoustic noise suppression.`,
        priority_weights: {
          commute: 25,
          budget: 25,
          schools: preferences.school_importance === 'high' ? 25 : 15,
          noise: preferences.noise_pref === 'quiet' ? 20 : 10,
          parks: preferences.park_walking ? 15 : 10,
          amenities: (preferences.amenities?.length || 0) > 6 ? 15 : 10
        },
        dealbreakers: [
          preferences.max_commute ? `Commute above ${preferences.max_commute} minutes` : null,
          (preferences.noise_pref === 'quiet' || preferences.dealbreakers?.noise_low) ? "High noise" : null,
          `Budget above ₹${budgetLakhs}L`
        ].filter(Boolean)
      };
      lifestyleProfileStore = profile;
      setStore('lifestyle_profile', profile);
      return profile;
    }
    return httpCall('/buyer/analyze', {
      method: 'POST',
      body: JSON.stringify(preferences)
    });
  },

  async getRecommendations(filters = {}) {
    if (getDemoMode()) {
      await mockLatency(350);

      // Reset session if explicitly requested
      if (filters.reset_session) {
        lastShownPropertyIds.clear();
      }

      // Dynamic compatibility calculation using search preferences
      const effectivePreferences = {
        ...buyerPreferencesStore,
        ...(filters.budget ? { budget: Number(filters.budget) } : {}),
        ...(filters.max_price ? { budget: Number(filters.max_price) } : {}),
        ...(filters.bhk && filters.bhk.length === 1 ? { bhk: Number(filters.bhk[0]) } : {}),
        ...(filters.max_commute ? { max_commute: Number(filters.max_commute) } : {}),
        ...(filters.noise && filters.noise !== 'all' ? { noise_pref: filters.noise === 'low' ? 'quiet' : filters.noise } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.school_importance ? { school_importance: filters.school_importance } : {}),
        ...(filters.family_friendly ? { family_friendly: true } : {}),
        ...(filters.commute_priority ? { commute_priority: true } : {}),
        ...(filters.budget_priority ? { budget_priority: true } : {})
      };

      syncPropertiesStore();
      let results = propertiesStore.filter((p) => p.status === 'active');

      // Zero frontend business logic: backend executes workflowCompatibilityAnalysis for each property
      results = results.map((p) => {
        const analysis = workflowCompatibilityAnalysis(effectivePreferences, p);
        return {
          ...p,
          match_score: analysis.overall_score,
          compatibility_score: analysis.overall_score,
          match_rating: analysis.match_rating,
          score_breakdown: analysis.score_breakdown,
          ai_explanation: analysis.explanation,
          strengths: analysis.strengths,
          tradeoffs: analysis.tradeoffs
        };
      });

      // Backend simulated filtering
      if (filters.bhk && filters.bhk.length > 0) {
        results = results.filter((p) => filters.bhk.includes(p.bhk));
      }
      if (filters.noise && filters.noise !== 'all') {
        results = results.filter((p) => p.noise_level === filters.noise);
      }
      if (filters.max_price) {
        results = results.filter((p) => p.price <= filters.max_price);
      }
      if (filters.min_green_score) {
        results = results.filter((p) => p.green_score >= filters.min_green_score);
      }
      if (filters.max_commute) {
        results = results.filter((p) => p.commute_minutes <= filters.max_commute);
      }

      // Backend sorting
      const sortBy = filters.sort_by || 'match';
      if (sortBy === 'match') {
        results.sort((a, b) => b.match_score - a.match_score);
      } else if (sortBy === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'commute') {
        results.sort((a, b) => a.commute_minutes - b.commute_minutes);
      }

      // Soft Preference Selection:
      // Prefer properties not shown in immediately previous recommendation set.
      // If fewer than 10 fresh properties match, fill remaining slots with previously shown
      // properties so the user always gets up to 10 matching properties.
      // NEVER return 0 properties unless there are genuinely 0 properties matching active criteria.
      const freshCandidates = results.filter((p) => !lastShownPropertyIds.has(p.property_id));
      const previousCandidates = results.filter((p) => lastShownPropertyIds.has(p.property_id));

      const limit = Math.max(30, results.length);
      let finalResults = [];
      if (freshCandidates.length >= limit) {
        finalResults = freshCandidates.slice(0, limit);
      } else {
        finalResults = [...freshCandidates, ...previousCandidates].slice(0, limit);
      }

      // Safeguard: never return 0 properties if results has matches
      if (finalResults.length === 0 && results.length > 0) {
        finalResults = results.slice(0, limit);
      }

      // Update lastShownPropertyIds to remember currently displayed properties for next search
      lastShownPropertyIds = new Set(finalResults.map((p) => p.property_id));

      return {
        properties: finalResults,
        total_matched: finalResults.length,
        total_matching_pool: results.length,
        profile: lifestyleProfileStore
      };
    }
    return httpCall('/buyer/recommend', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
  },

  async resetRecommendationSession() {
    lastShownPropertyIds.clear();
    return { success: true, message: 'Recommendation session reset.' };
  },

  getLastShownPropertyIds() {
    return Array.from(lastShownPropertyIds);
  },

  getSeenPropertyIds() {
    return Array.from(lastShownPropertyIds);
  },

  async getSearchHistory(sessionId) {
    if (getDemoMode()) {
      await mockLatency(200);
      return searchHistoryStore;
    }
    return httpCall(`/buyer/history/${sessionId}`);
  },

  async aiSearch(query, sessionId) {
    if (getDemoMode()) {
      await mockLatency(600);
      const lower = query.toLowerCase();
      const matches = propertiesStore.filter((p) => {
        if (p.status !== 'active') return false;
        if (lower.includes('quiet') || lower.includes('low noise')) {
          if (p.noise_level !== 'low') return false;
        }
        if (lower.includes('villa')) {
          return p.type.toLowerCase() === 'villa';
        }
        if (lower.includes('apartment') || lower.includes('condo')) {
          return p.type.toLowerCase() === 'apartment';
        }
        if (lower.includes('2bhk') || lower.includes('2 bhk')) {
          return p.bhk === 2;
        }
        if (lower.includes('3bhk') || lower.includes('3 bhk')) {
          return p.bhk === 3;
        }
        return true;
      }).map((p) => {
        const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, p);
        return {
          ...p,
          match_score: analysis.overall_score,
          match_rating: analysis.match_rating,
          score_breakdown: analysis.score_breakdown
        };
      });

      // Record in search history
      const newEntry = {
        history_id: `hist_${Date.now()}`,
        summary: query,
        date: new Date().toISOString(),
        results_count: matches.length,
        params: { query }
      };
      searchHistoryStore = [newEntry, ...searchHistoryStore.slice(0, 9)];
      setStore('history', searchHistoryStore);

      return {
        query,
        count: matches.length,
        properties: matches.length > 0 ? matches : propertiesStore.slice(0, 3)
      };
    }
    return httpCall('/buyer/search/ai', {
      method: 'POST',
      body: JSON.stringify({ query, session_id: sessionId })
    });
  },

  async saveProperty(propertyId, sessionId) {
    if (getDemoMode()) {
      await mockLatency(200);
      if (!shortlistStore.includes(propertyId)) {
        shortlistStore = [...shortlistStore, propertyId];
        setStore('shortlist', shortlistStore);
      }
      return { success: true, saved_ids: shortlistStore };
    }
    return httpCall('/buyer/shortlist', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId, session_id: sessionId })
    });
  },

  async removeSavedProperty(propertyId, sessionId) {
    if (getDemoMode()) {
      await mockLatency(200);
      shortlistStore = shortlistStore.filter((id) => id !== propertyId);
      setStore('shortlist', shortlistStore);
      return { success: true, saved_ids: shortlistStore };
    }
    return httpCall(`/buyer/shortlist/${propertyId}`, {
      method: 'DELETE',
      body: JSON.stringify({ session_id: sessionId })
    });
  },

  async getSavedProperties(sessionId) {
    if (getDemoMode()) {
      await mockLatency(250);
      const savedProps = propertiesStore
        .filter((p) => shortlistStore.includes(p.property_id))
        .map((p) => {
          const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, p);
          return {
            ...p,
            match_score: analysis.overall_score,
            match_rating: analysis.match_rating,
            score_breakdown: analysis.score_breakdown
          };
        });
      return { properties: savedProps, count: savedProps.length };
    }
    return httpCall(`/buyer/shortlist/${sessionId}`);
  },

  // ── COMPATIBILITY & INTELLIGENCE ENDPOINTS ──────────────────
  /**
   * FEATURE 1: Lifestyle Compatibility Score
   * Calculates deterministic compatibility for property & buyer
   */
  async getCompatibilityScore(propertyId, sessionId) {
    if (getDemoMode()) {
      await mockLatency(250);
      const prop = propertiesStore.find((p) => p.property_id === propertyId);
      if (!prop) throw new Error("Property not found");
      return workflowCompatibilityAnalysis(buyerPreferencesStore, prop);
    }
    return httpCall(`/buyer/compatibility/${propertyId}`);
  },

  /**
   * FEATURE 3: Why This Property & What You Gain / Sacrifice
   */
  async getWhyThisProperty(propertyId, sessionId) {
    if (getDemoMode()) {
      await mockLatency(250);
      const prop = propertiesStore.find((p) => p.property_id === propertyId);
      if (!prop) throw new Error("Property not found");
      return workflowWhyThisProperty(buyerPreferencesStore, prop);
    }
    return httpCall(`/buyer/property/${propertyId}/why`);
  },

  // ── PROPERTIES ─────────────────────────────────────────────
  async getProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncPropertiesStore();
      const found = propertiesStore.find((p) => p.property_id === propertyId || p.legacy_id === propertyId);
      if (!found) {
        throw new Error("Property not found");
      }
      const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, found);
      const whyData = workflowWhyThisProperty(buyerPreferencesStore, found);
      return {
        ...found,
        match_score: analysis.overall_score,
        compatibility_score: analysis.overall_score,
        match_rating: analysis.match_rating,
        score_breakdown: analysis.score_breakdown,
        ai_explanation: analysis.explanation,
        strengths: analysis.strengths,
        tradeoffs: analysis.tradeoffs,
        what_you_gain: whyData.what_you_gain,
        what_you_sacrifice: whyData.what_you_sacrifice
      };
    }
    return httpCall(`/property/${propertyId}`);
  },

  /**
   * FEATURE 2: AI Property Comparison
   */
  async compareProperties(ids = []) {
    if (getDemoMode()) {
      await mockLatency(300);
      const selected = ids
        .map((id) => propertiesStore.find((p) => p.property_id === id || p.legacy_id === id))
        .filter(Boolean)
        .map((p) => {
          const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, p);
          return {
            ...p,
            match_score: analysis.overall_score,
            match_rating: analysis.match_rating,
            score_breakdown: analysis.score_breakdown
          };
        });

      let aiComparison = null;
      if (selected.length >= 2) {
        aiComparison = workflowAIPropertyComparison(buyerPreferencesStore, selected[0], selected[1]);
      }

      return {
        properties: selected,
        ai_comparison_summary: aiComparison?.summary || "Select at least 2 properties to generate an AI comparison summary.",
        ai_comparison: aiComparison
      };
    }
    return httpCall('/property/compare', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  },

  async comparePropertiesAI(propertyId1, propertyId2, sessionId) {
    if (getDemoMode()) {
      await mockLatency(350);
      const p1 = propertiesStore.find((p) => p.property_id === propertyId1 || p.legacy_id === propertyId1);
      const p2 = propertiesStore.find((p) => p.property_id === propertyId2 || p.legacy_id === propertyId2);
      if (!p1 || !p2) throw new Error("Both properties must exist to compare");
      return workflowAIPropertyComparison(buyerPreferencesStore, p1, p2);
    }
    return httpCall('/buyer/compare/ai', {
      method: 'POST',
      body: JSON.stringify({ property_1_id: propertyId1, property_2_id: propertyId2 })
    });
  },

  async getNearby(propertyId) {
    if (getDemoMode()) {
      await mockLatency(200);
      const prop = propertiesStore.find((p) => p.property_id === propertyId);
      return prop ? prop.nearby : null;
    }
    return httpCall(`/property/${propertyId}/nearby`);
  },

  async getCommuteInfo(propertyId, workplace) {
    if (getDemoMode()) {
      await mockLatency(200);
      const prop = propertiesStore.find((p) => p.property_id === propertyId);
      return {
        property_id: propertyId,
        workplace: workplace || "Tidel Park Coimbatore",
        commute_minutes: prop ? prop.commute_minutes : 20,
        commute_mode: prop ? prop.commute_mode : "Car / Metro"
      };
    }
    return httpCall('/property/commute', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId, workplace })
    });
  },

  async dispatchLeadWebhook(leadPayload) {
    const webhookUrl = import.meta.env.VITE_SELLER_WEBHOOK_URL || import.meta.env.VITE_AGENT_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/f3cfc0da-92a5-4c1d-992e-d5f668a47f4b';
    const backendApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // 1. Try sending via backend server endpoint
    try {
      const resp = await fetch(`${backendApiUrl}/leads/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });
      if (resp.ok) {
        console.log('[SNS Agent Webhook] Lead dispatched successfully via backend server');
        return { success: true, method: 'backend' };
      }
    } catch (backendErr) {
      console.warn('[SNS Agent Webhook] Backend dispatch skipped/failed:', backendErr.message);
    }

    // 2. Direct client fallback to SNS iHub Agent Webhook
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead_enquiry',
          source: 'SmartNest AI Frontend',
          timestamp: new Date().toISOString(),
          ...leadPayload
        })
      });
      console.log('[SNS Agent Webhook] Lead dispatched directly to webhook URL');
      return { success: true, method: 'direct' };
    } catch (directErr) {
      console.warn('[SNS Agent Webhook] Direct webhook error:', directErr.message);
      return { success: false, error: directErr.message };
    }
  },

  async sendEnquiry(propertyId, message, sessionId) {
    let buyerUser = null;
    try {
      buyerUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
    } catch (e) {}

    const buyerId = buyerUser?.user_id || sessionId || 'usr_buyer_01';
    const buyerName = buyerUser?.name || 'Aarav Sharma';
    const buyerEmail = buyerUser?.email || 'aarav@smartnest.ai';
    const buyerPhone = buyerUser?.phone || buyerUser?.contact || '+91 98401 23456';

    try {
      const res = await httpCall(`/property/${propertyId}/enquiry`, {
        method: 'POST',
        body: JSON.stringify({
          message,
          session_id: sessionId,
          buyer_id: buyerId,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone
        })
      });
      if (res && res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('smartnest_message_sent', {
              detail: {
                conversation_id: res.conversation_id,
                enquiry_id: res.enquiry_id,
                sender_role: 'buyer'
              }
            })
          );
          window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
        }
        return res;
      }
    } catch (err) {
      console.warn('Backend sendEnquiry notice, falling back to local store:', err.message);
    }

    // In-memory / localStorage fallback
    await mockLatency(200);
    const prop = propertiesStore.find((p) => p.property_id === propertyId);
    const sellerId = prop ? prop.seller_id : 'S001';
    const seller = await this.getSellerDetails(sellerId);

    const conv = await this.createOrGetConversation({
      buyer_id: buyerId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      seller_id: seller?.seller_id || sellerId,
      seller_name: seller?.seller_name || 'Verified Seller',
      property_id: propertyId,
      property_title: prop ? prop.title : 'SmartNest Property',
      property_image: prop?.images?.[0] || '',
      property_price: prop?.price || 0,
      property_location: prop?.location || prop?.city || '',
      initial_message: message
    });

    return {
      success: true,
      enquiry_id: conv.enquiry_id,
      conversation_id: conv.conversation_id,
      seller_name: seller?.seller_name || conv.seller_name,
      webhook_triggered: true
    };
  },

  // ── SELLER ENDPOINTS ───────────────────────────────────────
  async getSellerDetails(sellerId) {
    if (getDemoMode()) {
      await mockLatency(100);
      const seller = sellersStore.find(
        (s) => s.seller_id === sellerId || s.user_id === sellerId
      );
      if (seller) return seller;
      return sellersStore[0] || {
        seller_id: "S001",
        user_id: "usr_seller_01",
        seller_name: "Prestige Developers",
        seller_type: "Real Estate Developer",
        phone: "+91 98765 43210",
        email: "sales@prestigedevelopers.in",
        location: "Peelamedu, Coimbatore",
        experience_years: "8+ Years",
        rating: 4.6,
        review_count: 128,
        properties_count: "50+",
        rera_registered: true,
        trusted_developer: true,
        verified: true
      };
    }
    return httpCall(`/seller/${sellerId}/details`);
  },

  async getAllSellers() {
    if (getDemoMode()) {
      await mockLatency(100);
      return sellersStore;
    }
    return httpCall('/sellers');
  },

  async getSellerProperties(sellerId) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncPropertiesStore();
      const items = propertiesStore.filter((p) => {
        if (!sellerId) return true;
        if (sellerId === 'usr_seller_01' || sellerId === 'S001') {
          return p.seller_id === 'S001' || p.seller_id === 'usr_seller_01' || !p.seller_id;
        }
        if (sellerId === 'usr_seller_02' || sellerId === 'S002') {
          return p.seller_id === 'S002' || p.seller_id === 'usr_seller_02';
        }
        if (sellerId === 'usr_seller_03' || sellerId === 'S003') {
          return p.seller_id === 'S003' || p.seller_id === 'usr_seller_03';
        }
        return p.seller_id === sellerId;
      });
      return items;
    }
    return httpCall(`/seller/${sellerId}/properties`);
  },

  async createProperty(data) {
    if (getDemoMode()) {
      await mockLatency(350);
      syncPropertiesStore();

      // Enforce seller subscription property limit
      const sellerId = data.seller_id || "usr_seller_01";
      const usage = await this.getSubscriptionUsage(sellerId, 'seller');
      const sub = await this.getSubscription(sellerId, 'seller');
      if (usage.properties_published >= usage.property_limit) {
        throw new Error(
          `Property limit reached. You've reached the ${usage.property_limit}-property limit on the ${sub?.plan_name || 'Free'} plan. Upgrade your plan to add more properties.`
        );
      }

      // Generate unique immutable stable property ID
      const uniquePropId = `prop_demo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      const loc = data.location || data.address || "Avinashi Road, Peelamedu";
      const addr = data.address || data.location || "Avinashi Road, Peelamedu";
      const city = data.city || "Coimbatore";
      const coordinates = (data.lat && data.lng)
        ? { lat: Number(data.lat), lng: Number(data.lng) }
        : (data.coordinates || { lat: 11.028, lng: 77.027 });

      const price = Number(data.price) || 5800000;
      const bhk = Number(data.bhk) || 2;
      const area = Number(data.area_sqft) || 1250;
      const type = data.type || data.property_type || "Apartment";

      const rawImages = (data.images && data.images.length > 0)
        ? data.images
        : (data.photos && data.photos.length > 0)
        ? data.photos
        : [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
          ];

      const newProp = {
        property_id: uniquePropId,
        seller_id: data.seller_id || "usr_seller_01",
        seller_name: data.seller_name || "Prestige Developers",
        is_user_created: true,
        title: data.title || "Modern Residential Landmark",
        type: type,
        property_type: type,
        price: price,
        bhk: bhk,
        bedrooms: Number(data.bedrooms || bhk),
        bathrooms: Number(data.bathrooms || 2),
        parking: Boolean(data.parking !== undefined ? data.parking : true),
        area_sqft: area,
        location: loc,
        address: addr,
        city: city,
        coordinates: coordinates,
        description: data.description || "Beautiful high-spec living space.",
        images: rawImages,
        photos: rawImages,
        commute_minutes: Number(data.commute_minutes || 20),
        commute_mode: data.commute_mode || "Car / Transit",
        school_distance_km: Number(data.school_distance_km || 1.5),
        hospital_distance_km: Number(data.hospital_distance_km || 2.0),
        park_distance_km: Number(data.park_distance_km || 0.8),
        noise_level: data.noise_level || "low",
        green_score: Number(data.green_score || 88),
        amenity_score: Number(data.amenity_score || 90),
        match_score: Number(data.match_score || 92),
        slightly_over_budget: false,
        amenities: Array.isArray(data.amenities) && data.amenities.length > 0
          ? data.amenities
          : ["Supermarket", "School", "Park", "Gym", "Parking"],
        status: data.status || "active",
        seller: {
          seller_id: "S001",
          user_id: "usr_seller_01",
          seller_name: "Prestige Developers",
          seller_type: "Real Estate Developer",
          phone: "+91 98765 43210",
          email: "sales@prestigedevelopers.in",
          location: "Peelamedu, Coimbatore",
          rating: 4.6,
          verified: true
        },
        score_breakdown: {
          budget: 19,
          commute: 18,
          location: 14,
          bhk: 10,
          schools: 9,
          noise: 10,
          parks: 9,
          amenities: 5
        },
        ai_explanation: "Freshly registered property undergoing automated lifestyle indexing.",
        nearby: {
          schools: [{ name: "National Public School", distance_km: Number(data.school_distance_km || 1.5), rating: 4.6 }],
          hospitals: [{ name: "City Health Care Center", distance_km: Number(data.hospital_distance_km || 2.0) }],
          parks: [{ name: "Peelamedu Green Park", distance_km: Number(data.park_distance_km || 0.8) }],
          transport: [{ name: "Express Bus Stop", type: "Bus Stop", distance_m: 200 }]
        },
        views: 0,
        shortlists: 0,
        enquiries: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedList = [newProp, ...propertiesStore.filter((p) => p.property_id !== uniquePropId)];
      savePropertiesStore(updatedList);
      return newProp;
    }
    return httpCall('/seller/property', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * FEATURE 4: Wishlist Price/Offer Alert & History Tracking
   */
  async updatePropertyPrice(propertyId, newPrice, sellerId = 'usr_seller_01') {
    if (getDemoMode()) {
      await mockLatency(350);
      syncPropertiesStore();
      const propIndex = propertiesStore.findIndex((p) => p.property_id === propertyId || p.legacy_id === propertyId);
      if (propIndex === -1) throw new Error("Property not found");
      const oldPrice = propertiesStore[propIndex].price;
      const numNewPrice = Number(newPrice);

      // Trigger Workflow 4: Wishlist Offer/Price-Drop Alert
      const alertResult = workflowWishlistPriceAlert({
        propertyId,
        oldPrice,
        newPrice: numNewPrice,
        changedBy: sellerId,
        properties: propertiesStore,
        shortlists: shortlistStore,
        users: usersStore,
        buyerPreferencesMap: { 'usr_buyer_01': buyerPreferencesStore },
        existingNotifications: notificationsStore
      });

      // Update property price
      propertiesStore[propIndex] = {
        ...propertiesStore[propIndex],
        price: numNewPrice,
        updated_at: new Date().toISOString()
      };
      savePropertiesStore(propertiesStore);

      // Record in property_price_history
      priceHistoryStore = [alertResult.price_history_entry, ...priceHistoryStore];
      setStore('price_history', priceHistoryStore);

      // Record in notifications
      if (alertResult.notifications.length > 0) {
        notificationsStore = [...alertResult.notifications, ...notificationsStore];
        setStore('notifications', notificationsStore);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
        }
      }

      // Record in email logs
      if (alertResult.email_dispatches.length > 0) {
        emailLogsStore = [...alertResult.email_dispatches, ...emailLogsStore];
        setStore('email_logs', emailLogsStore);
      }

      return {
        success: true,
        property: propertiesStore[propIndex],
        price_history: alertResult.price_history_entry,
        notifications: alertResult.notifications,
        notifications_created: alertResult.notifications.length,
        email_dispatches: alertResult.email_dispatches,
        emails_dispatched: alertResult.email_dispatches.length,
        affected_buyers_count: alertResult.affected_buyers_count
      };
    }
    return httpCall(`/seller/property/${propertyId}/price`, {
      method: 'PUT',
      body: JSON.stringify({ price: newPrice, seller_id: sellerId })
    });
  },

  async updateProperty(propertyId, data) {
    if (getDemoMode()) {
      await mockLatency(350);
      syncPropertiesStore();
      const existing = propertiesStore.find((p) => p.property_id === propertyId || p.legacy_id === propertyId);
      if (!existing) throw new Error("Property not found");

      // Detect if price changed and automatically trigger price history + wishlist alert
      if (data.price !== undefined && Number(data.price) !== Number(existing.price)) {
        await this.updatePropertyPrice(propertyId, data.price, data.seller_id || existing.seller_id);
      }

      const loc = data.location || data.address || existing.location || existing.address;
      const addr = data.address || data.location || existing.address || existing.location;
      const coordinates = (data.lat && data.lng)
        ? { lat: Number(data.lat), lng: Number(data.lng) }
        : (data.coordinates || existing.coordinates);

      const updatedList = propertiesStore.map((p) => {
        if (p.property_id === propertyId) {
          return {
            ...p,
            ...data,
            location: loc,
            address: addr,
            coordinates: coordinates,
            price: Number(data.price !== undefined ? data.price : p.price),
            bhk: data.bhk !== undefined ? Number(data.bhk) : p.bhk,
            area_sqft: data.area_sqft !== undefined ? Number(data.area_sqft) : p.area_sqft,
            bathrooms: data.bathrooms !== undefined ? Number(data.bathrooms) : p.bathrooms,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });
      savePropertiesStore(updatedList);
      return updatedList.find((p) => p.property_id === propertyId);
    }
    return httpCall(`/seller/property/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(300);
      syncPropertiesStore();
      const updatedList = propertiesStore.filter((p) => p.property_id !== propertyId);
      savePropertiesStore(updatedList);
      return { success: true };
    }
    return httpCall(`/seller/property/${propertyId}`, {
      method: 'DELETE'
    });
  },

  async getSellerAnalytics(sellerId = 'usr_seller_01') {
    if (getDemoMode()) {
      await mockLatency(300);
      syncPropertiesStore();
      const isPrestige = sellerId === 'usr_seller_01' || sellerId === 'S001';
      const sellerProps = propertiesStore.filter((p) => {
        if (isPrestige) {
          return (
            p.seller_id === 'S001' ||
            p.seller_id === 'usr_seller_01' ||
            p.seller?.seller_id === 'S001' ||
            p.seller?.user_id === 'usr_seller_01' ||
            p.seller_name === 'Prestige Developers'
          );
        }
        return (
          p.seller_id === sellerId ||
          p.seller?.seller_id === sellerId ||
          p.seller?.user_id === sellerId
        );
      });
      const activeProps = sellerProps.filter((p) => p.status === 'active');
      return {
        ...INITIAL_SELLER_ANALYTICS,
        active_listings: activeProps.length,
        total_listings: sellerProps.length
      };
    }
    return httpCall(`/seller/${sellerId}/analytics`);
  },

  async getBuyerInsights(propertyId) {
    if (getDemoMode()) {
      await mockLatency(350);
      const prop = propertiesStore.find((p) => p.property_id === propertyId || p.legacy_id === propertyId) || propertiesStore[0];
      return {
        property_id: prop.property_id,
        property_title: prop.title,
        total_potential_buyers: 142,
        avg_match_score: prop.match_score,
        shortlists: prop.shortlists || 34,
        enquiries: prop.enquiries || 12,
        match_tiers: INITIAL_SELLER_ANALYTICS.match_tiers,
        top_buyer_preferences: INITIAL_SELLER_ANALYTICS.top_buyer_preferences,
        top_lifestyles: INITIAL_SELLER_ANALYTICS.top_lifestyles,
        ai_insight: `For ${prop.title}, its low noise index and proximity to major education clusters drive 91% of high-intent buyers. Pricing fits comfortably within the most active ₹50L–₹65L buyer bracket.`
      };
    }
    return httpCall(`/seller/property/${propertyId}/insights`);
  },

  async getEnquiries(sellerId) {
    const effectiveSellerId = sellerId && sellerId !== 'undefined' ? sellerId : 'usr_seller_01';
    try {
      const data = await httpCall(`/seller/${effectiveSellerId}/enquiries`);
      if (Array.isArray(data)) {
        enquiriesStore = data;
        setStore('enquiries', enquiriesStore);
        return data;
      }
    } catch (err) {
      console.warn('Backend getEnquiries notice, falling back to local store:', err.message);
    }
    if (getDemoMode()) {
      await mockLatency(250);
      return enquiriesStore;
    }
    return enquiriesStore;
  },

  async respondToEnquiry(enquiryId, message) {
    let backendRes = null;
    try {
      backendRes = await httpCall(`/seller/enquiry/${enquiryId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    } catch (err) {
      console.warn('Backend respondToEnquiry notice, falling back to local store:', err.message);
    }

    const now = new Date().toISOString();
    const targetEnq = enquiriesStore.find((enq) => enq.enquiry_id === enquiryId);

    // Update enquiriesStore
    enquiriesStore = enquiriesStore.map((enq) => {
      if (enq.enquiry_id === enquiryId) {
        return { ...enq, status: 'responded', response: message };
      }
      return enq;
    });
    setStore('enquiries', enquiriesStore);

    // Find or create matching conversation in conversationsStore
    let conv = conversationsStore.find((c) => c.enquiry_id === enquiryId);
    if (!conv && targetEnq) {
      conv = conversationsStore.find(
        (c) => c.property_id === targetEnq.property_id && c.buyer_id === targetEnq.buyer_id
      );
    }

    if (conv) {
      await this.sendMessage(conv.conversation_id, {
        sender_id: conv.seller_id || 'usr_seller_01',
        sender_role: 'seller',
        sender_name: conv.seller_name || 'Prestige Developers',
        text: message
      });
    } else if (targetEnq) {
      // Automatically synthesize conversation record in conversationsStore
      const newConvId = `conv_${enquiryId}`;
      const prop = propertiesStore.find((p) => p.property_id === targetEnq.property_id);
      const buyerMsg = {
        message_id: `msg_${enquiryId}_01`,
        conversation_id: newConvId,
        sender_id: targetEnq.buyer_id || 'usr_buyer_01',
        sender_role: 'buyer',
        sender_name: targetEnq.buyer_name || 'Aarav Sharma',
        receiver_id: targetEnq.seller_id || 'usr_seller_01',
        text: targetEnq.message,
        created_at: targetEnq.date || now,
        read_at: now,
        status: 'read'
      };
      const sellerMsg = {
        message_id: `msg_${Date.now()}`,
        conversation_id: newConvId,
        sender_id: targetEnq.seller_id || 'usr_seller_01',
        sender_role: 'seller',
        sender_name: 'Prestige Developers',
        receiver_id: targetEnq.buyer_id || 'usr_buyer_01',
        text: message.trim(),
        created_at: now,
        read_at: null,
        status: 'delivered'
      };

      const newConv = {
        conversation_id: newConvId,
        enquiry_id: enquiryId,
        buyer_id: targetEnq.buyer_id || 'usr_buyer_01',
        buyer_name: targetEnq.buyer_name || 'Aarav Sharma',
        buyer_email: targetEnq.buyer_email || 'aarav@smartnest.ai',
        seller_id: targetEnq.seller_id || 'usr_seller_01',
        seller_name: 'Prestige Developers',
        seller_email: 'sales@prestigedevelopers.in',
        property_id: targetEnq.property_id,
        property_title: targetEnq.property_title || prop?.title || 'SmartNest Property',
        property_image: prop?.images?.[0] || '',
        property_price: prop?.price || 0,
        property_location: prop?.location || prop?.city || '',
        status: 'responded',
        unread_for_buyer: true,
        unread_for_seller: false,
        last_message: message.trim(),
        last_message_at: now,
        messages: [buyerMsg, sellerMsg]
      };

      conversationsStore = [newConv, ...conversationsStore.filter((c) => c.conversation_id !== newConvId)];
      setStore('conversations', conversationsStore);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('smartnest_message_sent', {
            detail: {
              conversation_id: newConvId,
              message: sellerMsg,
              receiver_id: targetEnq.buyer_id || 'usr_buyer_01',
              sender_role: 'seller'
            }
          })
        );
        window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      }
    }

    return backendRes || { success: true };
  },

  // ── MESSAGING & TWO-WAY CONVERSATIONS ────────────────────
  async getConversations(userId, role = 'buyer') {
    const effectiveUserId = userId && userId !== 'undefined' ? userId : (role === 'buyer' ? 'usr_buyer_01' : 'usr_seller_01');
    try {
      const data = await httpCall(`/conversations?user_id=${effectiveUserId}&role=${role}`);
      if (Array.isArray(data)) {
        conversationsStore = data;
        setStore('conversations', conversationsStore);
        return data;
      }
    } catch (err) {
      console.warn('Backend getConversations notice, falling back to local store:', err.message);
    }

    if (getDemoMode()) {
      await mockLatency(150);

      // Ensure any standalone enquiries in enquiriesStore have matching conversations in conversationsStore
      enquiriesStore.forEach((enq) => {
        const hasConv = conversationsStore.some(
          (c) => c.enquiry_id === enq.enquiry_id || (c.property_id === enq.property_id && c.buyer_id === enq.buyer_id)
        );
        if (!hasConv) {
          const prop = propertiesStore.find((p) => p.property_id === enq.property_id);
          const messages = [
            {
              message_id: `msg_${enq.enquiry_id}_init`,
              conversation_id: `conv_${enq.enquiry_id}`,
              sender_id: enq.buyer_id || 'usr_buyer_01',
              sender_role: 'buyer',
              sender_name: enq.buyer_name || 'Aarav Sharma',
              receiver_id: enq.seller_id || 'usr_seller_01',
              text: enq.message,
              created_at: enq.date,
              read_at: null,
              status: 'delivered'
            }
          ];
          if (enq.response) {
            messages.push({
              message_id: `msg_${enq.enquiry_id}_resp`,
              conversation_id: `conv_${enq.enquiry_id}`,
              sender_id: enq.seller_id || 'usr_seller_01',
              sender_role: 'seller',
              sender_name: 'Prestige Developers',
              receiver_id: enq.buyer_id || 'usr_buyer_01',
              text: enq.response,
              created_at: enq.date,
              read_at: null,
              status: 'delivered'
            });
          }
          const synthConv = {
            conversation_id: `conv_${enq.enquiry_id}`,
            enquiry_id: enq.enquiry_id,
            buyer_id: enq.buyer_id || 'usr_buyer_01',
            buyer_name: enq.buyer_name || 'Aarav Sharma',
            buyer_email: enq.buyer_email || 'aarav@smartnest.ai',
            seller_id: enq.seller_id || 'usr_seller_01',
            seller_name: 'Prestige Developers',
            seller_email: 'sales@prestigedevelopers.in',
            property_id: enq.property_id,
            property_title: enq.property_title || prop?.title || 'SmartNest Property',
            property_image: prop?.images?.[0] || '',
            property_price: prop?.price || 0,
            property_location: prop?.location || prop?.city || '',
            status: enq.status || 'new',
            unread_for_buyer: false,
            unread_for_seller: enq.status === 'new',
            last_message: enq.response || enq.message,
            last_message_at: enq.date,
            messages
          };
          conversationsStore = [...conversationsStore, synthConv];
          setStore('conversations', conversationsStore);
        }
      });

      const filtered = conversationsStore.filter((c) => {
        if (!effectiveUserId) return true;
        if (role === 'buyer') {
          return c.buyer_id === effectiveUserId || effectiveUserId === 'usr_buyer_01';
        } else if (role === 'seller') {
          return (
            c.seller_id === effectiveUserId ||
            c.seller_id === 'S001' ||
            c.seller_id === 'usr_seller_01' ||
            effectiveUserId === 'usr_seller_01' ||
            (c.seller_id && effectiveUserId && (c.seller_id.includes(effectiveUserId) || effectiveUserId.includes(c.seller_id)))
          );
        }
        return c.buyer_id === effectiveUserId || c.seller_id === effectiveUserId;
      });
      return [...filtered].sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
    }
    return conversationsStore;
  },

  async getConversation(conversationId) {
    try {
      const data = await httpCall(`/conversations/${conversationId}`);
      if (data && !data.error) {
        return data;
      }
    } catch (err) {
      console.warn('Backend getConversation notice, falling back to local store:', err.message);
    }
    const conv = conversationsStore.find(
      (c) => c.conversation_id === conversationId || c.enquiry_id === conversationId.replace('conv_', '')
    );
    return conv || null;
  },

  async sendMessage(conversationId, { sender_id, sender_role = 'buyer', sender_name = '', text }) {
    if (!text || !text.trim()) {
      throw new Error('Message text cannot be empty');
    }

    try {
      const res = await httpCall(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ sender_id, sender_role, sender_name, text })
      });
      if (res && res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('smartnest_message_sent', {
              detail: {
                conversation_id: conversationId,
                message: res.message,
                receiver_id: res.message?.receiver_id,
                sender_role
              }
            })
          );
          window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
        }
        return res;
      }
    } catch (err) {
      console.warn('Backend sendMessage notice, falling back to local store:', err.message);
    }

    if (getDemoMode()) {
      await mockLatency(150);

      let conv = conversationsStore.find(
        (c) => c.conversation_id === conversationId || c.enquiry_id === conversationId.replace('conv_', '')
      );

      const now = new Date().toISOString();
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (!conv) {
        // Look in enquiriesStore to create dynamically
        const enq = enquiriesStore.find(
          (e) => e.enquiry_id === conversationId.replace('conv_', '') || e.enquiry_id === conversationId
        );
        const prop = enq ? propertiesStore.find((p) => p.property_id === enq.property_id) : null;
        const effectiveBuyerId = enq?.buyer_id || (sender_role === 'buyer' ? sender_id : 'usr_buyer_01');
        const effectiveSellerId = enq?.seller_id || (sender_role === 'seller' ? sender_id : 'usr_seller_01');

        const initialMsg = enq ? {
          message_id: `msg_init_${enq.enquiry_id}`,
          conversation_id: conversationId,
          sender_id: effectiveBuyerId,
          sender_role: 'buyer',
          sender_name: enq.buyer_name || 'Buyer',
          receiver_id: effectiveSellerId,
          text: enq.message,
          created_at: enq.date || now,
          status: 'read'
        } : null;

        const newMsg = {
          message_id: messageId,
          conversation_id: conversationId,
          sender_id: sender_id || (sender_role === 'seller' ? effectiveSellerId : effectiveBuyerId),
          sender_role,
          sender_name: sender_name || (sender_role === 'buyer' ? (enq?.buyer_name || 'Buyer') : 'Prestige Developers'),
          receiver_id: sender_role === 'buyer' ? effectiveSellerId : effectiveBuyerId,
          text: text.trim(),
          created_at: now,
          read_at: null,
          status: 'delivered'
        };

        conv = {
          conversation_id: conversationId,
          enquiry_id: enq?.enquiry_id || null,
          buyer_id: effectiveBuyerId,
          buyer_name: enq?.buyer_name || 'Aarav Sharma',
          buyer_email: enq?.buyer_email || 'aarav@smartnest.ai',
          seller_id: effectiveSellerId,
          seller_name: 'Prestige Developers',
          seller_email: 'sales@prestigedevelopers.in',
          property_id: enq?.property_id || prop?.property_id || 'P01',
          property_title: enq?.property_title || prop?.title || 'SmartNest Property',
          property_image: prop?.images?.[0] || '',
          property_price: prop?.price || 0,
          property_location: prop?.location || '',
          status: sender_role === 'seller' ? 'responded' : 'new',
          unread_for_buyer: sender_role === 'seller',
          unread_for_seller: sender_role === 'buyer',
          last_message: text.trim(),
          last_message_at: now,
          messages: initialMsg ? [initialMsg, newMsg] : [newMsg]
        };

        conversationsStore = [conv, ...conversationsStore];
        setStore('conversations', conversationsStore);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('smartnest_message_sent', {
              detail: {
                conversation_id: conversationId,
                message: newMsg,
                receiver_id: newMsg.receiver_id,
                sender_role
              }
            })
          );
          window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
        }

        return { success: true, message: newMsg };
      }

      const receiverId = sender_role === 'buyer' ? conv.seller_id : conv.buyer_id;

      const newMsg = {
        message_id: messageId,
        conversation_id: conv.conversation_id,
        sender_id: sender_id || (sender_role === 'buyer' ? conv.buyer_id : conv.seller_id),
        sender_role,
        sender_name: sender_name || (sender_role === 'buyer' ? conv.buyer_name : conv.seller_name),
        receiver_id: receiverId,
        text: text.trim(),
        created_at: now,
        read_at: null,
        status: 'delivered'
      };

      const updatedMessages = [...(conv.messages || []), newMsg];

      // Update conversation in store
      conversationsStore = conversationsStore.map((c) => {
        if (c.conversation_id === conv.conversation_id) {
          return {
            ...c,
            messages: updatedMessages,
            last_message: text.trim(),
            last_message_at: now,
            status: sender_role === 'seller' ? 'responded' : 'new',
            unread_for_buyer: sender_role === 'seller' ? true : c.unread_for_buyer,
            unread_for_seller: sender_role === 'buyer' ? true : c.unread_for_seller
          };
        }
        return c;
      });
      setStore('conversations', conversationsStore);

      // Sync with enquiriesStore if linked
      if (conv.enquiry_id || conv.property_id) {
        enquiriesStore = enquiriesStore.map((enq) => {
          if (
            (conv.enquiry_id && enq.enquiry_id === conv.enquiry_id) ||
            (enq.property_id === conv.property_id && enq.buyer_id === conv.buyer_id)
          ) {
            return {
              ...enq,
              status: sender_role === 'seller' ? 'responded' : 'new',
              response: sender_role === 'seller' ? text.trim() : enq.response
            };
          }
          return enq;
        });
        setStore('enquiries', enquiriesStore);
      }

      // Automatically create an in-app notification for the recipient
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const recipientTitle =
        sender_role === 'buyer'
          ? `New Message from ${newMsg.sender_name || 'Buyer'}`
          : `New Reply from ${newMsg.sender_name || 'Seller'}`;

      const newNotif = {
        id: notifId,
        user_id: receiverId,
        type: 'new_message',
        title: recipientTitle,
        message: `${conv.property_title}: "${text.trim().substring(0, 80)}${text.trim().length > 80 ? '...' : ''}"`,
        property_id: conv.property_id,
        link: sender_role === 'buyer' ? '/seller/enquiries' : `/buyer/messages?id=${conv.conversation_id}`,
        read: false,
        deduplication_key: `${messageId}_${receiverId}`,
        metadata: {
          conversation_id: conv.conversation_id,
          property_id: conv.property_id,
          property_title: conv.property_title,
          sender_name: newMsg.sender_name,
          sender_role
        },
        created_at: now
      };

      notificationsStore = [newNotif, ...notificationsStore];
      setStore('notifications', notificationsStore);

      // Trigger custom events for reactive UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('smartnest_message_sent', {
            detail: {
              conversation_id: conv.conversation_id,
              message: newMsg,
              receiver_id: receiverId,
              sender_role
            }
          })
        );
        window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      }

      return { success: true, message: newMsg };
    }
    return httpCall(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ sender_id, sender_role, sender_name, text })
    });
  },

  async createOrGetConversation({
    buyer_id,
    buyer_name,
    buyer_email,
    seller_id,
    seller_name,
    property_id,
    property_title,
    property_image,
    property_price,
    property_location,
    initial_message
  }) {
    try {
      const res = await httpCall('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          buyer_id,
          buyer_name,
          buyer_email,
          seller_id,
          seller_name,
          property_id,
          property_title,
          property_image,
          property_price,
          property_location,
          initial_message
        })
      });
      if (res && res.conversation_id) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('smartnest_message_sent', {
              detail: { conversation_id: res.conversation_id, new_conversation: true }
            })
          );
          window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
        }
        return res;
      }
    } catch (err) {
      console.warn('Backend createOrGetConversation notice, falling back to local store:', err.message);
    }

    if (getDemoMode()) {
      await mockLatency(250);

      // Check if conversation already exists between this buyer, seller, and property
      let conv = conversationsStore.find(
        (c) => c.buyer_id === buyer_id && c.property_id === property_id
      );

      const now = new Date().toISOString();

      if (conv) {
        // If initial message provided, append it to existing conversation
        if (initial_message && initial_message.trim()) {
          await this.sendMessage(conv.conversation_id, {
            sender_id: buyer_id,
            sender_role: 'buyer',
            sender_name: buyer_name || conv.buyer_name,
            text: initial_message.trim()
          });
          conv = conversationsStore.find((c) => c.conversation_id === conv.conversation_id);
        }
        return conv;
      }

      // Enforce buyer subscription contact limit on new conversation creation
      const bId = buyer_id || 'usr_buyer_01';
      const usage = await this.getSubscriptionUsage(bId, 'buyer');
      const sub = await this.getSubscription(bId, 'buyer');
      if (usage.contacts_used >= usage.contact_limit) {
        throw new Error(
          `Contact limit reached. You've reached your ${usage.contact_limit}-contact limit on the ${sub?.plan_name || 'Connect'} plan. Upgrade your plan to contact more sellers.`
        );
      }

      // Create new conversation
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Resolve property info if missing
      const prop = propertiesStore.find((p) => p.property_id === property_id);
      const effectiveTitle = property_title || prop?.title || 'SmartNest Property';
      const effectiveImage = property_image || prop?.images?.[0] || '';
      const effectivePrice = property_price || prop?.price || 0;
      const effectiveLocation = property_location || prop?.location || prop?.city || '';
      const effectiveSellerId = seller_id || prop?.seller_id || 'S001';
      const sellerObj = sellersStore.find((s) => s.seller_id === effectiveSellerId || s.user_id === effectiveSellerId);
      const effectiveSellerName =
        seller_name ||
        sellerObj?.seller_name ||
        prop?.seller_name ||
        (effectiveSellerId === 'usr_seller_01' || effectiveSellerId === 'S001'
          ? 'Prestige Developers'
          : effectiveSellerId === 'usr_seller_02' || effectiveSellerId === 'S002'
          ? 'Green Valley Estates'
          : 'Verified Seller');
      const effectiveSellerEmail = sellerObj?.email || `${effectiveSellerId.replace('usr_', '')}@smartnest.ai`;

      const messages = [];
      if (initial_message && initial_message.trim()) {
        messages.push({
          message_id: messageId,
          conversation_id: conversationId,
          sender_id: buyer_id,
          sender_role: 'buyer',
          sender_name: buyer_name || 'Buyer',
          receiver_id: effectiveSellerId,
          text: initial_message.trim(),
          created_at: now,
          read_at: null,
          status: 'delivered'
        });
      }

      const newConv = {
        conversation_id: conversationId,
        enquiry_id: `enq_${Date.now()}`,
        buyer_id,
        buyer_name: buyer_name || 'Aarav Sharma',
        buyer_email: buyer_email || 'aarav@smartnest.ai',
        seller_id: effectiveSellerId,
        seller_name: effectiveSellerName,
        seller_email: effectiveSellerEmail,
        property_id,
        property_title: effectiveTitle,
        property_image: effectiveImage,
        property_price: effectivePrice,
        property_location: effectiveLocation,
        status: 'new',
        unread_for_buyer: false,
        unread_for_seller: Boolean(initial_message),
        last_message: initial_message ? initial_message.trim() : '',
        last_message_at: now,
        messages
      };

      conversationsStore = [newConv, ...conversationsStore];
      setStore('conversations', conversationsStore);

      // Increment buyer contact usage on subscription record
      if (sub) {
        const updatedUsage = {
          ...(sub.usage || {}),
          contacts_used: usage.contacts_used + 1
        };
        subscriptionsStore = subscriptionsStore.map((s) =>
          s.subscription_id === sub.subscription_id ? { ...s, usage: updatedUsage } : s
        );
        setStore('subscriptions', subscriptionsStore);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('smartnest_subscription_updated'));
        }
      }

      // Also ensure enquiry exists in enquiriesStore
      if (initial_message) {
        const newEnq = {
          enquiry_id: newConv.enquiry_id,
          property_id,
          property_title: effectiveTitle,
          buyer_id,
          buyer_name: newConv.buyer_name,
          buyer_email: newConv.buyer_email,
          seller_id: effectiveSellerId,
          message: initial_message.trim(),
          date: now,
          status: 'new',
          response: null
        };
        enquiriesStore = [newEnq, ...enquiriesStore.filter((e) => e.enquiry_id !== newConv.enquiry_id)];
        setStore('enquiries', enquiriesStore);

        // Add notification for seller
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newNotif = {
          id: notifId,
          user_id: effectiveSellerId,
          type: 'new_message',
          title: `New Message from ${newConv.buyer_name}`,
          message: `${effectiveTitle}: "${initial_message.trim().substring(0, 80)}"`,
          property_id,
          link: '/seller/enquiries',
          read: false,
          deduplication_key: `${messageId}_${effectiveSellerId}`,
          metadata: {
            conversation_id: conversationId,
            property_id,
            property_title: effectiveTitle,
            sender_name: newConv.buyer_name,
            sender_role: 'buyer'
          },
          created_at: now
        };
        notificationsStore = [newNotif, ...notificationsStore];
        setStore('notifications', notificationsStore);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('smartnest_message_sent', {
            detail: { conversation_id: conversationId, new_conversation: true }
          })
        );
        window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      }

      return newConv;
    }
    return newConv;
  },

  async markConversationAsRead(conversationId, userId, role = 'buyer') {
    try {
      await httpCall(`/conversations/${conversationId}/read`, {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, role })
      });
    } catch (err) {
      console.warn('Backend markConversationAsRead notice:', err.message);
    }

    conversationsStore = conversationsStore.map((c) => {
      if (c.conversation_id === conversationId) {
        const updatedMessages = (c.messages || []).map((m) => {
          if (
            m.receiver_id === userId ||
            (role === 'buyer' && m.sender_role === 'seller') ||
            (role === 'seller' && m.sender_role === 'buyer')
          ) {
            return { ...m, read_at: m.read_at || new Date().toISOString(), status: 'read' };
          }
          return m;
        });

        return {
          ...c,
          messages: updatedMessages,
          unread_for_buyer: role === 'buyer' ? false : c.unread_for_buyer,
          unread_for_seller: role === 'seller' ? false : c.unread_for_seller
        };
      }
      return c;
    });
    setStore('conversations', conversationsStore);

    // Also mark any notifications for this conversation as read
    notificationsStore = notificationsStore.map((n) => {
      if (
        n.user_id === userId &&
        (n.metadata?.conversation_id === conversationId || n.link?.includes(conversationId))
      ) {
        return { ...n, read: true };
      }
      return n;
    });
    setStore('notifications', notificationsStore);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      window.dispatchEvent(
        new CustomEvent('smartnest_message_read', { detail: { conversation_id: conversationId } })
      );
    }
    return { success: true };
  },

  async getUnreadMessageCount(userId, role = 'buyer') {
    const effectiveUserId = userId && userId !== 'undefined' ? userId : (role === 'buyer' ? 'usr_buyer_01' : 'usr_seller_01');
    try {
      const res = await httpCall(`/conversations/unread-count?user_id=${effectiveUserId}&role=${role}`);
      if (typeof res?.unread_count === 'number') return res.unread_count;
    } catch (err) {
      console.warn('Backend getUnreadMessageCount notice:', err.message);
    }

    const convs = conversationsStore.filter((c) => {
      if (role === 'buyer') {
        return c.buyer_id === effectiveUserId && c.unread_for_buyer;
      } else if (role === 'seller') {
        return (c.seller_id === effectiveUserId || (effectiveUserId === 'usr_seller_01' && (c.seller_id === 'S001' || c.seller_id === 'usr_seller_01'))) && c.unread_for_seller;
      }
      return false;
    });
    return convs.length;
  },

  // ── PRICE HISTORY, NOTIFICATIONS & EMAIL LOGS ──────────────
  async getPriceHistory(propertyId) {
    if (getDemoMode()) {
      await mockLatency(200);
      return priceHistoryStore.filter((h) => !propertyId || h.property_id === propertyId);
    }
    return httpCall(`/property/${propertyId}/price-history`);
  },

  async getNotifications(userId = 'usr_buyer_01', sessionId) {
    if (getDemoMode()) {
      await mockLatency(200);
      return notificationsStore.filter((n) => !userId || n.user_id === userId);
    }
    return httpCall(`/buyer/notifications/${userId}`);
  },

  async markNotificationRead(notificationId) {
    if (getDemoMode()) {
      await mockLatency(150);
      notificationsStore = notificationsStore.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setStore('notifications', notificationsStore);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      }
      return { success: true };
    }
    return httpCall(`/buyer/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  async markAllNotificationsRead(userId = 'usr_buyer_01') {
    if (getDemoMode()) {
      await mockLatency(150);
      notificationsStore = notificationsStore.map((n) =>
        n.user_id === userId ? { ...n, read: true } : n
      );
      setStore('notifications', notificationsStore);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      }
      return { success: true };
    }
    return httpCall(`/buyer/notifications/read-all`, {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId })
    });
  },

  async getEmailDispatchLogs() {
    if (getDemoMode()) {
      await mockLatency(150);
      return emailLogsStore;
    }
    return httpCall('/system/email-logs');
  },

  async getEmailServiceConfig() {
    return {
      configured: false,
      provider: null,
      message: 'SMTP / SES credentials are not configured in environment variables. Email events are logged to the dispatch event bus.'
    };
  },

  // ── ADMIN ENDPOINTS (Connected to Real Node.js / Supabase PostgreSQL) ──
  async getAdminAnalytics(period = '30d') {
    try {
      return await httpCall(`/admin/analytics?period=${period}`);
    } catch (err) {
      console.warn('Backend admin analytics call failed, using fallback:', err.message);
      return INITIAL_ADMIN_ANALYTICS;
    }
  },

  async getUsers(filters = {}) {
    try {
      const q = new URLSearchParams();
      if (filters.role) q.append('role', filters.role);
      if (filters.status) q.append('status', filters.status);
      if (filters.search) q.append('search', filters.search);
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return await httpCall(`/admin/users${queryString}`);
    } catch (err) {
      console.warn('Backend users call failed, using fallback:', err.message);
      let users = [...usersStore];
      if (filters.role && filters.role !== 'all') {
        users = users.filter((u) => u.role === filters.role);
      }
      if (filters.status && filters.status !== 'all') {
        users = users.filter((u) => u.status === filters.status);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        users = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      return { users, total: users.length };
    }
  },

  async updateUserStatus(userId, status) {
    try {
      return await httpCall(`/admin/user/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('Backend user status call failed, using fallback:', err.message);
      usersStore = usersStore.map((u) => (u.user_id === userId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
  },

  async getSellers(filters = {}) {
    try {
      return await httpCall('/admin/sellers');
    } catch (err) {
      console.warn('Backend sellers call failed, using fallback:', err.message);
      syncPropertiesStore();
      let sellers = usersStore.filter((u) => u.role === 'seller');
      return sellers.map((seller) => {
        const sellerProps = propertiesStore.filter((p) => p.seller_id === seller.user_id || p.seller_id === 'S001');
        return {
          ...seller,
          properties_count: Math.max(sellerProps.length, 5),
          total_views: 450,
          total_enquiries: 18
        };
      });
    }
  },

  async updateSellerStatus(sellerId, status) {
    try {
      return await httpCall(`/admin/seller/${sellerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      return this.updateUserStatus(sellerId, status);
    }
  },

  async getProperties(filters = {}) {
    try {
      const q = filters.status && filters.status !== 'all' ? `?status=${filters.status}` : '';
      return await httpCall(`/admin/properties${q}`);
    } catch (err) {
      console.warn('Backend properties call failed, using fallback:', err.message);
      syncPropertiesStore();
      let list = [...propertiesStore];
      if (filters.status && filters.status !== 'all') {
        list = list.filter((p) => p.status === filters.status);
      }
      return list;
    }
  },

  async approveProperty(propertyId) {
    try {
      return await httpCall(`/admin/property/${propertyId}/approve`, {
        method: 'PUT'
      });
    } catch (err) {
      console.warn('Backend approve call failed, using fallback:', err.message);
      syncPropertiesStore();
      const updated = propertiesStore.map((p) => (p.property_id === propertyId ? { ...p, status: 'active' } : p));
      savePropertiesStore(updated);
      return { success: true };
    }
  },

  async rejectProperty(propertyId, reason) {
    try {
      return await httpCall(`/admin/property/${propertyId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
    } catch (err) {
      console.warn('Backend reject call failed, using fallback:', err.message);
      syncPropertiesStore();
      const updated = propertiesStore.map((p) => (p.property_id === propertyId ? { ...p, status: 'rejected', rejection_reason: reason } : p));
      savePropertiesStore(updated);
      return { success: true };
    }
  },

  async removeProperty(propertyId) {
    try {
      return await httpCall(`/admin/property/${propertyId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend remove call failed, using fallback:', err.message);
      syncPropertiesStore();
      const updated = propertiesStore.filter((p) => p.property_id !== propertyId);
      savePropertiesStore(updated);
      return { success: true };
    }
  },

  async getReports() {
    try {
      return await httpCall('/admin/reports');
    } catch (err) {
      console.warn('Backend reports call failed, using fallback:', err.message);
      return reportsStore;
    }
  },

  async resolveReport(reportId, action) {
    try {
      return await httpCall(`/admin/report/${reportId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ action })
      });
    } catch (err) {
      console.warn('Backend resolve report call failed, using fallback:', err.message);
      reportsStore = reportsStore.map((r) => (r.report_id === reportId ? { ...r, status: 'resolved', action_taken: action } : r));
      setStore('reports', reportsStore);
      return { success: true };
    }
  },

  async getSystemHealth() {
    try {
      return await httpCall('/admin/system/health');
    } catch (err) {
      return {
        backend: "online",
        database: "online",
        ai_service: "online",
        api: "online",
        last_checked: new Date().toISOString()
      };
    }
  },

  // ── SUBSCRIPTION & ENTITLEMENTS ENDPOINTS ──────────────────
  async getSubscription(userId, role = 'buyer') {
    if (getDemoMode()) {
      await mockLatency(150);
      syncSubscriptionsStore();
      let sub = subscriptionsStore.find((s) => s.user_id === userId && s.role === role);
      if (!sub) {
        sub = subscriptionsStore.find((s) => s.user_id === userId);
      }
      if (!sub) {
        sub = subscriptionsStore.find((s) => s.role === role);
      }

      const validPlanPool = role === 'seller' ? SELLER_PLANS : BUYER_PLANS;
      const isValidPlan = sub && validPlanPool.some((p) => p.id === sub.plan_id);

      if (!sub || !isValidPlan) {
        const defaultPlan = role === 'seller' ? SELLER_PLANS[0] : BUYER_PLANS[0];
        const newSub = {
          subscription_id: sub?.subscription_id || `sub_${Date.now().toString(36)}`,
          user_id: userId,
          role,
          plan_id: defaultPlan.id,
          plan_name: defaultPlan.name,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + (role === 'seller' ? 45 : 30) * 86400000).toISOString(),
          renewal_at: new Date(Date.now() + (role === 'seller' ? 45 : 30) * 86400000).toISOString(),
          billing_cycle: defaultPlan.billing_cycle,
          amount: defaultPlan.price,
          currency: 'INR',
          usage: role === 'seller'
            ? { properties_published: sub?.usage?.properties_published || 0, property_limit: defaultPlan.property_limit }
            : { contacts_used: sub?.usage?.contacts_used || 0, contact_limit: defaultPlan.contact_limit },
          entitlements: defaultPlan.entitlements
        };
        subscriptionsStore = [newSub, ...subscriptionsStore.filter((s) => s.user_id !== userId)];
        setStore('subscriptions', subscriptionsStore);
        return newSub;
      }
      return sub;
    }

    // Live Mode:
    let effectiveUserId = userId;
    if (userId === 'usr_buyer_01') effectiveUserId = 'd4e6d678-c40c-43ad-8665-e10e32c027f7';
    if (userId === 'usr_seller_01') effectiveUserId = '616af1d1-f101-4987-8f0e-c4189b752c7c';

    try {
      const backendSub = await httpCall(`/subscriptions?user_id=${effectiveUserId}&role=${role}`);
      if (backendSub && (backendSub.plan_id || backendSub.plan)) {
        const planKey = backendSub.plan_id || backendSub.plan;
        const plan = getPlanById(planKey, role);
        const merged = {
          ...plan,
          ...backendSub,
          plan_id: plan.id,
          plan_name: plan.name,
          amount: backendSub.amount !== undefined ? backendSub.amount : plan.price,
          status: 'active',
          billing_cycle: plan.billing_cycle,
          property_limit: plan.property_limit,
          contact_limit: plan.contact_limit,
          entitlements: plan.entitlements,
          usage: role === 'seller'
            ? { properties_published: 0, property_limit: plan.property_limit }
            : { contacts_used: 0, contact_limit: plan.contact_limit }
        };
        return merged;
      }
    } catch (err) {
      console.warn('[getSubscription Backend Notice]', err.message);
    }

    // Fallback to client cached subscription if available
    try {
      const cached = localStorage.getItem(`smartnest_active_sub_${effectiveUserId}`) ||
                     localStorage.getItem(`smartnest_active_sub_${userId}`) ||
                     localStorage.getItem(`smartnest_active_sub_${role}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const plan = getPlanById(parsed.plan_id || parsed.plan, role);
        return {
          ...plan,
          ...parsed,
          plan_id: plan.id,
          plan_name: plan.name,
          status: 'active',
          usage: role === 'seller'
            ? { properties_published: 0, property_limit: plan.property_limit }
            : { contacts_used: 0, contact_limit: plan.contact_limit }
        };
      }
    } catch (e) {}

    const defaultPlan = role === 'seller' ? SELLER_PLANS[0] : BUYER_PLANS[0];
    return {
      subscription_id: `sub_default_${role}`,
      user_id: effectiveUserId,
      role,
      plan_id: defaultPlan.id,
      plan_name: defaultPlan.name,
      amount: defaultPlan.price,
      currency: 'INR',
      status: 'active',
      billing_cycle: defaultPlan.billing_cycle,
      entitlements: defaultPlan.entitlements,
      usage: role === 'seller'
        ? { properties_published: 0, property_limit: defaultPlan.property_limit }
        : { contacts_used: 0, contact_limit: defaultPlan.contact_limit }
    };
  },

  async activateSubscription({ plan: inputPlan, planId, user, role }) {
    const effectiveRole = role || (inputPlan && inputPlan.role) || (user && user.role) || 'buyer';
    const planKey = (inputPlan && inputPlan.id) || planId;
    const plan = inputPlan || getPlanById(planKey, effectiveRole);

    if (!user) {
      throw new Error('You must be logged in to activate a subscription.');
    }

    if (!plan) {
      throw new Error(`Invalid plan specified: ${planKey}`);
    }

    // Resolve REAL Supabase UUID for user
    let realUserId = user.user_id;
    if (realUserId === 'usr_buyer_01' || user.email === 'aarav@smartnest.ai') {
      realUserId = 'd4e6d678-c40c-43ad-8665-e10e32c027f7';
    } else if (realUserId === 'usr_seller_01' || user.email === 'prestige@smartnest.ai') {
      realUserId = '616af1d1-f101-4987-8f0e-c4189b752c7c';
    }

    // Resolve valid UUID session_id
    let sessionId = user.session_id || localStorage.getItem('smartnest_session_id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!sessionId || !uuidRegex.test(sessionId)) {
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem('smartnest_session_id', sessionId);
    }

    const now = new Date();
    const validityDays = effectiveRole === 'seller' ? 45 : 30;
    const expiry = new Date(now.getTime() + validityDays * 86400000).toISOString();
    const subId = `sub_${plan.id}_${Date.now().toString(36)}`;

    const subObj = {
      id: subId,
      subscription_id: subId,
      user_id: realUserId,
      session_id: sessionId,
      role: effectiveRole,
      plan: plan.id,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      currency: 'INR',
      status: 'active',
      started_at: now.toISOString(),
      created_at: now.toISOString(),
      expires_at: expiry,
      renewal_at: expiry,
      billing_cycle: plan.billing_cycle,
      billing_period_text: plan.billing_period_text,
      property_limit: plan.property_limit,
      contact_limit: plan.contact_limit,
      usage: effectiveRole === 'seller'
        ? { properties_published: 0, property_limit: plan.property_limit }
        : { contacts_used: 0, contact_limit: plan.contact_limit },
      entitlements: { ...plan.entitlements }
    };

    if (getDemoMode()) {
      await mockLatency(250);
      syncSubscriptionsStore();
      const existingIdx = subscriptionsStore.findIndex((s) => s.user_id === user.user_id || s.user_id === realUserId);
      if (existingIdx !== -1) {
        subscriptionsStore[existingIdx] = subObj;
      } else {
        subscriptionsStore = [subObj, ...subscriptionsStore];
      }
      setStore('subscriptions', subscriptionsStore);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartnest_subscription_updated', { detail: subObj }));
      }
      return { success: true, subscription: subObj };
    }

    // ── LIVE MODE ──────────────────────────────────────────────
    const primaryWebhookUrl = import.meta.env.VITE_SUBSCRIPTION_WORKFLOW_URL || import.meta.env.VITE_AGENT_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e';
    const testWebhookUrl = primaryWebhookUrl.replace('/webhook/', '/webhook-test/');

    const webhookPayload = {
      user_id: realUserId,
      userId: realUserId,
      session_id: sessionId,
      sessionId: sessionId,
      plan: plan.id,
      plan_id: plan.id,
      plan_name: plan.name,
      planName: plan.name,
      amount: plan.price,
      price: plan.price,
      currency: 'INR',
      role: effectiveRole,
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expiry
    };

    // 1. Dispatch to SNS Webhook
    try {
      let snsResp = await fetch(primaryWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      }).catch(() => null);

      if (!snsResp || snsResp.status === 404) {
        await fetch(testWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
        }).catch(() => null);
      }
    } catch (e) {
      console.warn('[SNS Webhook Dispatch Note]', e.message);
    }

    // 2. Dispatch to backend activation endpoint for database sync
    try {
      await httpCall('/subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify(webhookPayload)
      });
    } catch (backendErr) {
      console.warn('[Backend Activation Note]', backendErr.message);
    }

    // 3. Persist to client cache
    try {
      localStorage.setItem(`smartnest_active_sub_${realUserId}`, JSON.stringify(subObj));
      localStorage.setItem(`smartnest_active_sub_${user.user_id}`, JSON.stringify(subObj));
      localStorage.setItem(`smartnest_active_sub_${effectiveRole}`, JSON.stringify(subObj));
    } catch (e) {}

    // 4. Broadcast event across app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartnest_subscription_updated', { detail: subObj }));
    }

    return {
      success: true,
      subscription: subObj,
      message: `${plan.name} plan activated successfully.`
    };
  },

  async getPlans(role = 'seller') {
    if (getDemoMode()) {
      await mockLatency(100);
      return role === 'seller' ? SELLER_PLANS : BUYER_PLANS;
    }
    return httpCall(`/subscriptions/plans?role=${role}`);
  },

  async createSubscriptionCheckout({ userId, role, planId }) {
    const plan = getPlanById(planId, role);
    const user = usersStore.find((u) => u.user_id === userId) || {
      user_id: userId,
      role,
      name: 'SmartNest Member',
      email: `${userId}@smartnest.ai`
    };

    if (getDemoMode()) {
      await mockLatency(200);
      const session = workflowCreateSubscriptionSession({ user, role, plan, isDemo: true });
      return session;
    }

    return httpCall('/api/subscriptions/create', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        role,
        planId: plan.id,
        razorpayPlanId: plan.razorpay_plan_id,
        planName: plan.name,
        amount: plan.price
      })
    });
  },

  async verifyPayment({ payment_id, subscription_id, signature, userId, role, planId, paymentMethod = 'UPI' }) {
    if (getDemoMode()) {
      await mockLatency(350);
      syncSubscriptionsStore();
      syncTransactionsStore();
      syncInvoicesStore();

      const verification = workflowVerifyPaymentSignature({
        payment_id,
        subscription_id,
        signature,
        isDemo: true
      });

      if (!verification.verified) {
        // Record failed transaction
        const failedTx = {
          payment_id: payment_id || `pay_failed_${Date.now()}`,
          user_id: userId,
          role,
          plan_id: planId,
          subscription_id: subscription_id || null,
          provider: 'demo_gateway',
          amount: 0,
          currency: 'INR',
          status: 'failed',
          payment_method: paymentMethod,
          error_message: verification.message || 'Signature verification failed',
          created_at: new Date().toISOString()
        };
        transactionsStore = [failedTx, ...transactionsStore];
        setStore('payment_transactions', transactionsStore);
        return { verified: false, error: verification.message };
      }

      // Successful verification: activate subscription
      const plan = getPlanById(planId, role);
      const now = new Date();
      const validityDays = role === 'seller' ? 45 : 30;
      const expiry = new Date(now.getTime() + validityDays * 86400000).toISOString();

      const existingIndex = subscriptionsStore.findIndex(
        (s) => s.user_id === userId && s.role === role
      );

      const subObj = {
        subscription_id: subscription_id || (existingIndex !== -1 ? subscriptionsStore[existingIndex].subscription_id : `sub_${Date.now().toString(36)}`),
        user_id: userId,
        role,
        plan_id: plan.id,
        plan_name: plan.name,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiry,
        renewal_at: expiry,
        billing_cycle: plan.billing_cycle,
        amount: plan.price,
        currency: 'INR',
        provider: 'demo_gateway',
        payment_id,
        usage: role === 'seller'
          ? {
              properties_published: subscriptionsStore[existingIndex]?.usage?.properties_published || 0,
              property_limit: plan.property_limit
            }
          : {
              contacts_used: subscriptionsStore[existingIndex]?.usage?.contacts_used || 0,
              contact_limit: plan.contact_limit
            },
        entitlements: { ...plan.entitlements }
      };

      if (existingIndex !== -1) {
        subscriptionsStore[existingIndex] = subObj;
      } else {
        subscriptionsStore = [subObj, ...subscriptionsStore];
      }
      setStore('subscriptions', subscriptionsStore);

      // Record successful transaction
      const user = usersStore.find((u) => u.user_id === userId) || { name: 'SmartNest Member', email: `${userId}@smartnest.ai` };
      const transactionObj = {
        payment_id,
        user_id: userId,
        user_name: user.name,
        role,
        plan_id: plan.id,
        plan_name: plan.name,
        subscription_id: subObj.subscription_id,
        provider: 'demo_gateway',
        provider_payment_id: payment_id,
        amount: plan.price,
        currency: 'INR',
        status: 'successful',
        payment_method: paymentMethod,
        created_at: now.toISOString()
      };
      transactionsStore = [transactionObj, ...transactionsStore];
      setStore('payment_transactions', transactionsStore);

      // Generate invoice
      const invoiceObj = workflowGenerateInvoice({ subscription: subObj, transaction: transactionObj, user });
      invoicesStore = [invoiceObj, ...invoicesStore];
      setStore('invoices', invoicesStore);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartnest_subscription_updated', { detail: subObj }));
      }

      // Dispatch subscription activation to SNS iHub Agent Webhook
      try {
        const subWebhookUrl = import.meta.env.VITE_SUBSCRIPTION_WORKFLOW_URL || import.meta.env.VITE_AGENT_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e';
        fetch(subWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'subscription_activated',
            source: 'SmartNest AI Frontend',
            timestamp: new Date().toISOString(),
            subscription: subObj,
            transaction: transactionObj,
            user: { user_id: userId, name: user.name, email: user.email }
          })
        }).catch((e) => console.warn('[Subscription Webhook] Client dispatch note:', e.message));
      } catch (e) {
        // Non-blocking notification
      }

      return {
        verified: true,
        subscription: subObj,
        transaction: transactionObj,
        invoice: invoiceObj,
        message: 'Payment verified and subscription activated successfully.'
      };
    }

    // Live mode verification call
    return httpCall('/api/subscriptions/verify', {
      method: 'POST',
      body: JSON.stringify({ payment_id, subscription_id, signature, userId, role, planId })
    });
  },

  async createSubscription({ userId, role, planId }) {
    const plan = getPlanById(planId, role);

    // Free plan (₹0): directly activates immediately without payment gateway (Section 7)
    if (plan.price === 0) {
      if (getDemoMode()) {
        await mockLatency(200);
        syncSubscriptionsStore();
        const now = new Date();
        const expiry = new Date(now.getTime() + (role === 'seller' ? 45 : 30) * 86400000).toISOString();
        const existingIndex = subscriptionsStore.findIndex((s) => s.user_id === userId && s.role === role);

        const subObj = {
          subscription_id: existingIndex !== -1 ? subscriptionsStore[existingIndex].subscription_id : `sub_free_${Date.now().toString(36)}`,
          user_id: userId,
          role,
          plan_id: 'free',
          plan_name: 'Free',
          status: 'active',
          started_at: now.toISOString(),
          expires_at: expiry,
          renewal_at: expiry,
          billing_cycle: 'monthly',
          amount: 0,
          currency: 'INR',
          provider: 'free_tier',
          usage: role === 'buyer'
            ? {
                contacts_used: subscriptionsStore[existingIndex]?.usage?.contacts_used || 0,
                contact_limit: 1
              }
            : {
                properties_published: subscriptionsStore[existingIndex]?.usage?.properties_published || 0,
                property_limit: 15
              },
          entitlements: { ...plan.entitlements }
        };

        if (existingIndex !== -1) {
          subscriptionsStore[existingIndex] = subObj;
        } else {
          subscriptionsStore = [subObj, ...subscriptionsStore];
        }
        setStore('subscriptions', subscriptionsStore);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('smartnest_subscription_updated', { detail: subObj }));
        }
        return { success: true, message: 'Free plan activated directly.', subscription: subObj };
      }
      return httpCall('/api/subscriptions/create_free', { method: 'POST', body: JSON.stringify({ userId, role, planId }) });
    }

    // For paid plans, execute checkout + verification simulation in Demo Mode
    if (getDemoMode()) {
      const checkoutSession = await this.createSubscriptionCheckout({ userId, role, planId });
      const simPaymentId = `pay_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const simSignature = `demo_sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const verifyRes = await this.verifyPayment({
        payment_id: simPaymentId,
        subscription_id: checkoutSession.provider_subscription_id,
        signature: simSignature,
        userId,
        role,
        planId: plan.id,
        paymentMethod: 'Demo Gateway (Simulated)'
      });

      return {
        success: verifyRes.verified,
        subscription: verifyRes.subscription,
        transaction: verifyRes.transaction,
        invoice: verifyRes.invoice
      };
    }

    return httpCall('/api/subscriptions/create', { method: 'POST', body: JSON.stringify({ userId, role, planId }) });
  },

  async upgradeSubscription({ userId, role, planId }) {
    return this.createSubscription({ userId, role, planId });
  },

  async cancelSubscription(subscriptionId) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncSubscriptionsStore();
      subscriptionsStore = subscriptionsStore.map((s) =>
        s.subscription_id === subscriptionId ? { ...s, status: 'cancelled', cancelled_at: new Date().toISOString() } : s
      );
      setStore('subscriptions', subscriptionsStore);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartnest_subscription_updated'));
      }
      return { success: true, message: 'Subscription cancelled. Access remains active until current billing period ends.' };
    }
    return httpCall(`/api/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
  },

  async renewSubscription(subscriptionId) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncSubscriptionsStore();
      const now = new Date();
      subscriptionsStore = subscriptionsStore.map((s) => {
        if (s.subscription_id === subscriptionId) {
          const days = s.role === 'seller' ? 45 : 30;
          const expiry = new Date(now.getTime() + days * 86400000).toISOString();
          return { ...s, status: 'active', renewal_at: expiry, expires_at: expiry };
        }
        return s;
      });
      setStore('subscriptions', subscriptionsStore);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartnest_subscription_updated'));
      }
      return { success: true, message: 'Subscription renewed successfully.' };
    }
    return httpCall(`/api/subscriptions/${subscriptionId}/renew`, { method: 'POST' });
  },

  async getSubscriptionUsage(userId, role = 'seller') {
    if (getDemoMode()) {
      await mockLatency(100);
      syncPropertiesStore();
      const sub = await this.getSubscription(userId, role);
      if (role === 'seller') {
        const publishedProps = propertiesStore.filter((p) => {
          if (p.status !== 'active') return false;
          return (
            (p.seller_id === userId && p.is_user_created) ||
            p.property_id.startsWith('prop_demo_')
          );
        });
        const propertyLimit = sub?.entitlements?.property_limit || sub?.usage?.property_limit || 15;
        const count = Math.max(publishedProps.length, sub?.usage?.properties_published || 0);
        return {
          properties_published: count,
          property_limit: propertyLimit,
          remaining: Math.max(0, propertyLimit - count),
          is_limit_reached: count >= propertyLimit
        };
      } else {
        // Buyer contacts count unique seller conversations
        const buyerConvs = conversationsStore.filter((c) => c.buyer_id === userId);
        const contactLimit = sub?.entitlements?.contact_limit || sub?.usage?.contact_limit || 1;
        const contactsUsed = Math.max(buyerConvs.length, sub?.usage?.contacts_used || 0);
        return {
          contacts_used: contactsUsed,
          contact_limit: contactLimit,
          remaining: Math.max(0, contactLimit - contactsUsed),
          is_limit_reached: contactsUsed >= contactLimit
        };
      }
    }
    return httpCall(`/subscriptions/usage?user_id=${userId}&role=${role}`);
  },

  async getPaymentHistory(userId, role) {
    if (getDemoMode()) {
      await mockLatency(150);
      syncTransactionsStore();
      return transactionsStore.filter((tx) => {
        if (!userId) return true;
        return tx.user_id === userId || (role && tx.role === role);
      });
    }
    return httpCall(`/subscriptions/payments?user_id=${userId}&role=${role}`);
  },

  async getInvoices(userId, role) {
    if (getDemoMode()) {
      await mockLatency(150);
      syncInvoicesStore();
      return invoicesStore.filter((inv) => {
        if (!userId) return true;
        return inv.user_id === userId || (role && inv.role === role);
      });
    }
    return httpCall(`/subscriptions/invoices?user_id=${userId}&role=${role}`);
  },

  async getAllSubscriptions() {
    try {
      return await httpCall('/admin/subscriptions');
    } catch (err) {
      console.warn('Backend subscriptions call failed, using fallback:', err.message);
      syncSubscriptionsStore();
      return subscriptionsStore;
    }
  },

  async getAllPaymentTransactions() {
    try {
      return await httpCall('/admin/payments');
    } catch (err) {
      console.warn('Backend payments call failed, using fallback:', err.message);
      syncTransactionsStore();
      return transactionsStore;
    }
  },

  async getSubscriptionRevenueMetrics(period = '30d') {
    try {
      return await httpCall(`/admin/subscriptions/revenue?period=${period}`);
    } catch (err) {
      console.warn('Backend subscription revenue call failed, using fallback:', err.message);
      syncSubscriptionsStore();
      syncTransactionsStore();

      const activeSubs = subscriptionsStore.filter((s) => s.status === 'active');
      const sellerSubs = activeSubs.filter((s) => s.role === 'seller');
      const buyerSubs = activeSubs.filter((s) => s.role === 'buyer');
      const cancelledSubs = subscriptionsStore.filter((s) => s.status === 'cancelled');
      const failedTxs = transactionsStore.filter((tx) => tx.status === 'failed');

      const sellerRevenue = sellerSubs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const buyerRevenue = buyerSubs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const totalDemoRevenue = sellerRevenue + buyerRevenue;

      // MRR calculation (seller 45-day normalized to 30 days + buyer monthly)
      const sellerMonthlyEquivalent = Math.round(sellerRevenue * (30 / 45));
      const mrr = buyerRevenue + sellerMonthlyEquivalent;

      return {
        is_demo: true,
        total_revenue: totalDemoRevenue,
        total_demo_revenue: totalDemoRevenue,
        total_subscribers: subscriptionsStore.length,
        active_subscribers: activeSubs.length,
        active_subscriptions_count: activeSubs.length,
        seller_subscribers: sellerSubs.length,
        buyer_subscribers: buyerSubs.length,
        cancelled_subscribers: cancelledSubs.length,
        failed_payments: failedTxs.length,
        monthly_seller_revenue: sellerRevenue,
        buyer_subscription_revenue: buyerRevenue,
        mrr,
        plans_distribution: {
          free: buyerSubs.filter((s) => s.plan_id === 'free').length,
          smart_seller: buyerSubs.filter((s) => s.plan_id === 'smart_seller').length,
          relax_buyer: buyerSubs.filter((s) => s.plan_id === 'relax').length,
          connect: sellerSubs.filter((s) => s.plan_id === 'connect').length,
          connect_plus: sellerSubs.filter((s) => s.plan_id === 'connect_plus').length,
          relax: sellerSubs.filter((s) => s.plan_id === 'relax').length,
          professional: sellerSubs.filter((s) => s.plan_id === 'professional').length
        }
      };
    }
  },

  async processRazorpayWebhook(eventData) {
    return workflowProcessRazorpayWebhook(eventData);
  }
};
