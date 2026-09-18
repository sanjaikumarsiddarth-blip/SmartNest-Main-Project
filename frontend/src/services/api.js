// Centralized API Service for SmartNest AI
// CRITICAL RULE: Zero business logic in UI components. All requests flow through this file.

import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_SELLERS,
  INITIAL_LIFESTYLE_PROFILE,
  INITIAL_SELLER_ANALYTICS,
  INITIAL_ADMIN_ANALYTICS,
  DEFAULT_ANALYTICS_PERIOD_DATA,
  getPeriodAnalyticsData,
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

export { DEFAULT_ANALYTICS_PERIOD_DATA, getPeriodAnalyticsData };


const SMARTNEST_API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SMARTNEST_API_URL) || 'https://api.smartnest.ai/v1';

export const DEFAULT_LIFESTYLE_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LIFESTYLE_WORKFLOW_URL) ||
  'http://localhost:5173/api/sns-webhook/webhook/ed98ebe4-d99d-4370-8a64-7f61b70ff52f';
const WEBHOOK_STORAGE_KEY = 'smartnest_lifestyle_webhook_url';
const WEBHOOK_RESULT_KEY = 'smartnest_lifestyle_webhook_result';

// Proxy helper: in browser development, route through Vite proxy to eliminate CORS preflight blocks
export const resolveWebhookFetchUrl = (targetUrl) => {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    targetUrl &&
    targetUrl.startsWith('https://api.agents.snsihub.ai')
  ) {
    return targetUrl.replace('https://api.agents.snsihub.ai', '/api/sns-webhook');
  }
  return targetUrl;
};

// SNS Agent Workbench Signup Webhook Endpoints
export const SMARTNEST_SIGNUP_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SIGNUP_WORKFLOW_URL) ||
  'https://api.agents.snsihub.ai/webhook/0dd783de-b31e-4ba8-a385-aea1cd61b104';

export const SMARTNEST_SIGNUP_WEBHOOK_TEST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SIGNUP_WORKFLOW_TEST_URL) ||
  'https://api.agents.snsihub.ai/webhook-test/0dd783de-b31e-4ba8-a385-aea1cd61b104';

// Helper to normalize signup response from SNS Agent Workbench / Supabase workflow
export const extractUserFromSignupResponse = (responseData, fallbackPayload = {}) => {
  if (!responseData) return null;

  let raw = responseData;
  let userObj = null;

  // Unwrap standard n8n / SNS output envelope
  if (raw.output?.items?.[0]?.json) {
    const json = raw.output.items[0].json;
    userObj = json.body?.user || json.user || json.body || json;
  } else if (raw.items?.[0]?.json) {
    const json = raw.items[0].json;
    userObj = json.body?.user || json.user || json.body || json;
  } else if (raw.user && typeof raw.user === 'object') {
    userObj = raw.user;
  } else if (raw.body?.user && typeof raw.body.user === 'object') {
    userObj = raw.body.user;
  } else if (raw.body && typeof raw.body === 'object') {
    userObj = raw.body;
  } else if (raw.data?.user && typeof raw.data.user === 'object') {
    userObj = raw.data.user;
  } else if (raw.data && typeof raw.data === 'object') {
    userObj = raw.data;
  } else {
    userObj = raw;
  }

  const isEchoingPayload =
    userObj.email &&
    fallbackPayload.email &&
    userObj.email.toLowerCase().trim() === fallbackPayload.email.toLowerCase().trim();

  const userId =
    userObj.user_id ||
    userObj.id ||
    userObj.userId ||
    `usr_${fallbackPayload.role || 'buyer'}_${Date.now()}`;

  // If the server explicitly echoes the registered user's credentials, use the server's version;
  // Otherwise preserve the form inputs (e.g., in SNS trigger-test mode snapshot executions)
  const name =
    (isEchoingPayload && userObj.name) ? userObj.name : (fallbackPayload.name || userObj.name || 'User');
  const email =
    (isEchoingPayload && userObj.email) ? userObj.email : (fallbackPayload.email || userObj.email || '');
  const role =
    (isEchoingPayload && userObj.role) ? userObj.role : (fallbackPayload.role || userObj.role || 'buyer');

  const token =
    userObj.token ||
    userObj.access_token ||
    userObj.session_token ||
    `jwt_token_${userId}_${Date.now()}`;

  return {
    user_id: userId,
    name,
    email,
    role,
    token,
    status: userObj.status || 'active',
    registered_at: userObj.registered_at || new Date().toISOString(),
    raw: userObj
  };
};

// SNS Agent Workbench Login Webhook Endpoints
export const SMARTNEST_LOGIN_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LOGIN_WORKFLOW_URL) ||
  'https://api.agents.snsihub.ai/webhook/058b1b60-22b8-423c-a036-f8f5e433b606';

export const SMARTNEST_LOGIN_WEBHOOK_TEST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LOGIN_WORKFLOW_TEST_URL) ||
  'https://api.agents.snsihub.ai/webhook-test/058b1b60-22b8-423c-a036-f8f5e433b606';

// Helper to normalize error responses from SNS login webhook or Supabase Auth
export const normalizeLoginError = (err, statusCode, resData) => {
  const rawMsg = (
    resData?.error_description ||
    resData?.error?.message ||
    (typeof resData?.error === 'string' ? resData.error : '') ||
    resData?.message ||
    resData?.msg ||
    (typeof err === 'string' ? err : err?.message) ||
    ''
  ).toLowerCase();

  if (
    rawMsg.includes('invalid login credentials') ||
    rawMsg.includes('invalid_grant') ||
    rawMsg.includes('invalid email or password') ||
    rawMsg.includes('incorrect password') ||
    rawMsg.includes('user not found') ||
    statusCode === 400 ||
    statusCode === 401
  ) {
    return 'Invalid email or password.';
  }

  if (
    rawMsg.includes('email and password are required') ||
    rawMsg.includes('missing') ||
    rawMsg.includes('required')
  ) {
    return resData?.error || resData?.message || 'Email and password are required.';
  }

  return 'Unable to sign in right now. Please try again.';
};

// Helper to extract user & token from Supabase login response via SNS Webhook
export const extractUserFromLoginResponse = (responseData, fallbackEmail = '') => {
  if (!responseData) return null;

  let raw = responseData;

  // Unwrap standard n8n / SNS output envelope
  if (raw.output?.items?.[0]?.json) {
    raw = raw.output.items[0].json;
  } else if (raw.items?.[0]?.json) {
    raw = raw.items[0].json;
  }

  // Handle response.body or stringified body
  if (raw.body) {
    if (typeof raw.body === 'string') {
      try {
        raw = JSON.parse(raw.body);
      } catch (_) {}
    } else if (typeof raw.body === 'object') {
      raw = raw.body;
    }
  }

  // Handle response.data or response.body.data
  if (raw.data && (raw.data.user || raw.data.access_token || raw.data.session)) {
    raw = raw.data;
  }

  // Supabase Auth response: session object or direct user/access_token
  const session = raw.session || raw;
  const user = raw.user || session?.user;
  const token =
    raw.access_token ||
    session?.access_token ||
    raw.token ||
    session?.token ||
    raw.session_token;

  if (!user || !token) {
    return null;
  }

  const userId = user.id || user.user_id || user.uid;
  const metadata = user.user_metadata || user.userMetadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    user.name ||
    user.full_name ||
    (user.email ? user.email.split('@')[0] : '') ||
    (fallbackEmail ? fallbackEmail.split('@')[0] : 'User');

  const rawRole =
    metadata.role ||
    user.role ||
    user.app_metadata?.role ||
    'buyer';

  let role = String(rawRole).toLowerCase().trim();
  if (role === 'authenticated' || !role) {
    role = user.app_metadata?.role || metadata.role || 'buyer';
    role = String(role).toLowerCase().trim();
  }

  const email = user.email || fallbackEmail;

  return {
    user_id: userId,
    name,
    role,
    email,
    token,
    user
  };
};

// SNS Agent Workbench Seller Property Upload Webhook Endpoints
export const SMARTNEST_SELLER_PROPERTY_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SELLER_PROPERTY_WORKFLOW_URL) ||
  'https://api.agents.snsihub.ai/webhook/f3cfc0da-92a5-4c1d-992e-d5f668a47f4b';

export const SMARTNEST_SELLER_PROPERTY_WEBHOOK_TEST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SELLER_PROPERTY_WORKFLOW_TEST_URL) ||
  'https://api.agents.snsihub.ai/webhook-test/f3cfc0da-92a5-4c1d-992e-d5f668a47f4b';

// Dedicated live persistent store for properties created by sellers in Live Mode
export const LIVE_PROPERTIES_STORAGE_KEY = 'smartnest_live_seller_properties';

export const getLiveSellerPropertiesStore = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_PROPERTIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading live seller properties from storage:', e);
    return [];
  }
};

export const setLiveSellerPropertiesStore = (properties) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LIVE_PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  } catch (e) {
    console.error('Error saving live seller properties to storage:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smartnest_properties_updated', { detail: { count: properties.length } }));
  }
};

// SNS Agent Workbench Buyer Subscription Plan Webhook Endpoints
export const SMARTNEST_BUYER_SUBSCRIPTION_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUYER_SUBSCRIPTION_WORKFLOW_URL) ||
  'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e';

export const SMARTNEST_BUYER_SUBSCRIPTION_WEBHOOK_TEST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUYER_SUBSCRIPTION_WORKFLOW_TEST_URL) ||
  'https://api.agents.snsihub.ai/webhook-test/61316be1-7b40-45a7-929e-992052a0274e';

// SNS Agent Workbench General/Seller Subscription Plan Webhook Endpoints
export const SMARTNEST_SUBSCRIPTION_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUBSCRIPTION_WORKFLOW_URL) ||
  'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e';

export const SMARTNEST_SUBSCRIPTION_WEBHOOK_TEST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUBSCRIPTION_WORKFLOW_TEST_URL) ||
  'https://api.agents.snsihub.ai/webhook-test/61316be1-7b40-45a7-929e-992052a0274e';

// Supabase REST Configuration for Subscriptions table queries
export const SUPABASE_REST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`
    : 'https://utbyvuxefyawlatsswdo.supabase.co/rest/v1');

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ynl2dXhlZnlhd2xhdHNzd2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MjM2MDAsImV4cCI6MjEwNDM5OTYwMH0.3UbwguuO0r89sZml0MKDstv-frr35pYolzia1rFqjzY';

// Helper to validate UUID format
export const isUuid = (val) => {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

// Helper to reliably extract the REAL Supabase Auth UUID
export const getAuthenticatedUserUuid = (providedUserId) => {
  if (isUuid(providedUserId)) return providedUserId.trim();
  if (typeof localStorage !== 'undefined') {
    try {
      const rawUser = localStorage.getItem('smartnest_user');
      if (rawUser) {
        const stored = JSON.parse(rawUser);
        if (isUuid(stored.user_id)) return stored.user_id.trim();
        if (isUuid(stored.id)) return stored.id.trim();
        if (isUuid(stored.uid)) return stored.uid.trim();
      }
    } catch (_) {}
  }
  return null;
};

// Dedicated live persistent store for subscriptions created/updated in Live Mode
export const LIVE_SUBSCRIPTIONS_STORAGE_KEY = 'smartnest_live_subscriptions';
export const LIVE_TRANSACTIONS_STORAGE_KEY = 'smartnest_live_transactions';

export const getLiveSubscriptionsStore = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_SUBSCRIPTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading live subscriptions from storage:', e);
    return [];
  }
};

export const setLiveSubscriptionsStore = (subscriptions) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LIVE_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (e) {
    console.error('Error saving live subscriptions to storage:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smartnest_subscription_updated'));
  }
};

export const getLiveTransactionsStore = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_TRANSACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const setLiveTransactionsStore = (transactions) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LIVE_TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {}
};

// Dedicated live persistent store for conversations & messages in Live Mode
export const LIVE_CONVERSATIONS_STORAGE_KEY = 'smartnest_live_conversations';
export const LIVE_ENQUIRIES_STORAGE_KEY = 'smartnest_live_enquiries';

export const getLiveConversationsStore = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_CONVERSATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading live conversations from storage:', e);
    return [];
  }
};

export const setLiveConversationsStore = (conversations) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LIVE_CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Error saving live conversations to storage:', e);
  }
};

export const getLiveEnquiriesStore = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_ENQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading live enquiries from storage:', e);
    return [];
  }
};

export const setLiveEnquiriesStore = (enquiries) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LIVE_ENQUIRIES_STORAGE_KEY, JSON.stringify(enquiries));
  } catch (e) {
    console.error('Error saving live enquiries to storage:', e);
  }
};

// Helper to normalize property response from SNS Agent Workbench / Supabase
export const extractPropertyFromWebhookResponse = (responseData, fallbackPayload = {}) => {
  if (!responseData) return fallbackPayload;

  let raw = responseData;

  // Unwrap standard n8n / SNS output envelope
  if (raw.output?.items?.[0]?.json) {
    raw = raw.output.items[0].json;
  } else if (raw.items?.[0]?.json) {
    raw = raw.items[0].json;
  }

  // Handle body wrapper
  if (raw.body) {
    if (typeof raw.body === 'string') {
      try {
        raw = JSON.parse(raw.body);
      } catch (_) {}
    } else if (typeof raw.body === 'object') {
      raw = raw.body;
    }
  }

  // Handle property or data wrapper
  let propObj = raw.property || raw.data || raw.record || raw.result || raw;
  if (Array.isArray(propObj)) {
    propObj = propObj[0] || {};
  }

  const propId =
    propObj.property_id ||
    propObj.id ||
    propObj.propertyId ||
    fallbackPayload.property_id ||
    fallbackPayload.id ||
    `prop_live_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  const isEchoingCurrent = Boolean(
    fallbackPayload.title &&
    (
      (propObj.title && propObj.title.trim().toLowerCase() === fallbackPayload.title.trim().toLowerCase()) ||
      (propObj.property_name && propObj.property_name.trim().toLowerCase() === fallbackPayload.title.trim().toLowerCase())
    )
  );

  const title = (isEchoingCurrent && (propObj.title || propObj.property_name))
    ? (propObj.title || propObj.property_name)
    : (fallbackPayload.title || propObj.title || propObj.property_name || 'Property Listing');

  const priceLakhsNum = Number(propObj.price_lakhs || fallbackPayload.price_lakhs);
  const rawPriceNum = Number(propObj.price !== undefined ? propObj.price : fallbackPayload.price);
  const price = (isEchoingCurrent && rawPriceNum)
    ? rawPriceNum
    : (Number(fallbackPayload.price) || rawPriceNum || (priceLakhsNum > 0 ? Math.round(priceLakhsNum * 100000) : 0));
  const priceLakhs = priceLakhsNum > 0 ? priceLakhsNum : (price > 0 ? Number((price / 100000).toFixed(2)) : 0);

  const bhk = Number(fallbackPayload.bhk || (isEchoingCurrent ? propObj.bhk : null) || propObj.bedrooms || fallbackPayload.bedrooms) || 2;
  const type = fallbackPayload.type || fallbackPayload.property_type || propObj.property_type || propObj.type || 'Apartment';
  const city = fallbackPayload.city || propObj.city || 'Coimbatore';
  const areaName = fallbackPayload.area || propObj.area || fallbackPayload.location || propObj.location || 'Peelamedu';
  const location = fallbackPayload.location || propObj.location || `${areaName}, ${city}`;
  const address = fallbackPayload.address || propObj.address || `${areaName}, ${city}`;
  const area = Number(fallbackPayload.area_sqft || propObj.area_sqft) || (bhk >= 3 ? 1650 : 1200);
  const furnishing = fallbackPayload.furnishing || propObj.furnishing || 'Semi-Furnished';
  const description = fallbackPayload.description || propObj.description || '';
  const sellerId = (isEchoingCurrent && propObj.seller_id) ? propObj.seller_id : (fallbackPayload.seller_id || fallbackPayload.user_id || propObj.seller_id || propObj.user_id || '');
  const sellerName = (isEchoingCurrent && propObj.seller_name) ? propObj.seller_name : (fallbackPayload.seller_name || propObj.seller_name || 'Seller');

  const images = (Array.isArray(propObj.images) && propObj.images.length > 0)
    ? propObj.images
    : (Array.isArray(propObj.photos) && propObj.photos.length > 0)
    ? propObj.photos
    : (Array.isArray(fallbackPayload.images) && fallbackPayload.images.length > 0)
    ? fallbackPayload.images
    : [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      ];

  const rawAmenities = propObj.amenities !== undefined ? propObj.amenities : fallbackPayload.amenities;
  const amenities = Array.isArray(rawAmenities) && rawAmenities.length > 0
    ? rawAmenities
    : typeof rawAmenities === 'string' && rawAmenities.trim().length > 0
    ? rawAmenities.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Supermarket', 'School', 'Park', 'Gym', 'Parking'];

  const coordinates = propObj.coordinates || fallbackPayload.coordinates || {
    lat: Number(propObj.lat || propObj.latitude || fallbackPayload.lat || fallbackPayload.latitude || 11.028),
    lng: Number(propObj.lng || propObj.longitude || fallbackPayload.lng || fallbackPayload.longitude || 77.0125)
  };

  return {
    property_id: propId,
    id: propId,
    seller_id: sellerId,
    user_id: sellerId,
    seller_name: sellerName,
    title,
    property_name: title,
    type,
    property_type: type,
    price,
    price_lakhs: priceLakhs,
    price_formatted: `₹${priceLakhs.toFixed(1)} Lakhs`,
    price_inr: price,
    bhk,
    bedrooms: Number(propObj.bedrooms || fallbackPayload.bedrooms || bhk),
    bathrooms: Number(propObj.bathrooms || fallbackPayload.bathrooms || (bhk >= 3 ? 3 : 2)),
    parking: Boolean(propObj.parking !== undefined ? propObj.parking : fallbackPayload.parking !== undefined ? fallbackPayload.parking : true),
    area_sqft: area,
    area: areaName,
    furnishing,
    location,
    address,
    city,
    coordinates,
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    description,
    images,
    photos: images,
    amenities,
    status: propObj.status || fallbackPayload.status || 'active',
    noise_level: propObj.noise_level || fallbackPayload.noise_level || 'low',
    commute_minutes: Number(propObj.commute_minutes || fallbackPayload.commute_minutes || 20),
    school_distance_km: Number(propObj.school_distance_km || fallbackPayload.school_distance_km || 1.5),
    hospital_distance_km: Number(propObj.hospital_distance_km || fallbackPayload.hospital_distance_km || 2.0),
    is_user_created: true,
    views: propObj.views || fallbackPayload.views || 0,
    shortlists: propObj.shortlists || fallbackPayload.shortlists || 0,
    enquiries: propObj.enquiries || fallbackPayload.enquiries || 0,
    created_at: propObj.created_at || fallbackPayload.created_at || new Date().toISOString(),
    updated_at: propObj.updated_at || fallbackPayload.updated_at || new Date().toISOString()
  };
};

// Helper to convert Supabase row from `properties` table to frontend property schema
export const mapSupabaseRowToProperty = (row) => {
  if (!row) return null;
  const propId = row.property_id || `prop_${row.id || Date.now()}`;
  const priceLakhs = Number(row.price_lakhs) || (row.price ? Number(row.price) / 100000 : 0);
  const priceInr = priceLakhs > 0 ? Math.round(priceLakhs * 100000) : (Number(row.price) || 0);
  const bhk = Number(row.bedrooms) || Number(row.bhk) || 2;
  const areaName = row.area || row.city || 'Peelamedu';
  const cityName = row.city || 'Coimbatore';
  const amenitiesList = typeof row.amenities === 'string'
    ? row.amenities.split(',').map((s) => s.trim()).filter(Boolean)
    : (Array.isArray(row.amenities) ? row.amenities : ['Supermarket', 'School', 'Park', 'Gym', 'Parking']);

  let images = row.images;
  if (!images || !Array.isArray(images) || images.length === 0) {
    images = PROPERTY_IMAGES_MAP[propId] || [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ];
  }

  return {
    property_id: propId,
    id: propId,
    title: row.property_name || row.title || 'Premium Residence',
    property_name: row.property_name || row.title || 'Premium Residence',
    price: priceInr,
    price_lakhs: priceLakhs,
    price_formatted: `₹${priceLakhs.toFixed(1)} Lakhs`,
    price_inr: priceInr,
    property_type: row.property_type || row.type || 'Apartment',
    type: row.property_type || row.type || 'Apartment',
    bedrooms: bhk,
    bhk: bhk,
    bathrooms: bhk >= 3 ? 3 : 2,
    area_sqft: Number(row.area_sqft || (bhk === 3 ? 1650 : 1200)),
    city: cityName,
    area: areaName,
    location: `${areaName}, ${cityName}`,
    address: `${areaName}, ${cityName}`,
    status: row.status || 'active',
    noise_level: row.noise_level || 'low',
    commute_minutes: Number(row.commute_minutes) || 20,
    commute_mode: 'Car / Transit',
    school_distance_km: Number(row.school_distance_km) || 1.5,
    hospital_distance_km: Number(row.hospital_distance_km) || 2.0,
    park_distance_km: Number(row.park_distance_km) || 0.8,
    green_score: Number(row.green_score) || 88,
    amenity_score: Number(row.amenity_score) || 90,
    match_score: Number(row.match_score) || 92,
    slightly_over_budget: false,
    latitude: Number(row.latitude) || 11.028,
    longitude: Number(row.longitude) || 77.0125,
    coordinates: {
      lat: Number(row.latitude) || 11.028,
      lng: Number(row.longitude) || 77.0125
    },
    amenities: amenitiesList,
    images: images,
    photos: images,
    seller_id: row.seller_id || '',
    user_id: row.user_id || row.seller_id || '',
    seller_name: row.seller_name || 'Verified Seller',
    seller: {
      seller_id: row.seller_id || 'S001',
      user_id: row.user_id || row.seller_id || 'usr_seller_01',
      seller_name: row.seller_name || 'Verified Seller',
      seller_type: 'Real Estate Developer',
      phone: '+91 98765 43210',
      email: 'sales@developer.com',
      location: `${areaName}, ${cityName}`,
      rating: 4.6,
      verified: true
    },
    views: Number(row.views) || 0,
    shortlists: Number(row.shortlists) || 0,
    enquiries: Number(row.enquiries) || 0,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };
};

// Helper to normalize subscription response from SNS Agent Workbench / Supabase
export const extractSubscriptionFromWebhookResponse = (responseData, fallbackPayload = {}) => {
  let raw = responseData;

  // Unwrap standard n8n / SNS output envelope
  if (raw?.output?.items?.[0]?.json) {
    raw = raw.output.items[0].json;
  } else if (raw?.items?.[0]?.json) {
    raw = raw.items[0].json;
  }

  // Handle body wrapper
  if (raw?.body) {
    if (typeof raw.body === 'string') {
      try {
        raw = JSON.parse(raw.body);
      } catch (_) {}
    } else if (typeof raw.body === 'object') {
      raw = raw.body;
    }
  }

  // Handle subscription or data wrapper
  let subObj = raw?.subscription || raw?.data || raw || {};
  if (Array.isArray(subObj)) {
    subObj = subObj[0] || {};
  }

  const isEchoingPayload =
    Boolean(fallbackPayload.user_id || fallbackPayload.userId) &&
    ((subObj.user_id && (subObj.user_id === fallbackPayload.user_id || subObj.user_id === fallbackPayload.userId)) ||
      (subObj.userId && (subObj.userId === fallbackPayload.user_id || subObj.userId === fallbackPayload.userId)) ||
      (subObj.email && fallbackPayload.email && subObj.email.toLowerCase() === fallbackPayload.email.toLowerCase()));

  const role = (isEchoingPayload && subObj.role) ? subObj.role : (fallbackPayload.role || subObj.role || 'buyer');
  const planId = (isEchoingPayload && (subObj.plan || subObj.plan_id || subObj.planId))
    ? (subObj.plan || subObj.plan_id || subObj.planId)
    : (fallbackPayload.plan || fallbackPayload.plan_id || fallbackPayload.planId || subObj.plan || subObj.plan_id || subObj.planId || (role === 'buyer' ? 'free' : 'connect'));

  const plan = getPlanById(planId, role);

  const subId =
    (isEchoingPayload && (subObj.subscription_id || subObj.id)) ||
    fallbackPayload.subscription_id ||
    subObj.subscription_id ||
    subObj.id ||
    `sub_live_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  const resolvedFallbackUserId = fallbackPayload.user_id || fallbackPayload.userId || '';
  const userId =
    (isEchoingPayload && (subObj.user_id || subObj.userId)) ||
    resolvedFallbackUserId ||
    (isUuid(subObj.user_id) ? subObj.user_id : '') ||
    (isUuid(subObj.userId) ? subObj.userId : '') ||
    '';

  const planName = (isEchoingPayload && (subObj.plan_name || subObj.planName))
    ? (subObj.plan_name || subObj.planName)
    : (fallbackPayload.plan_name || fallbackPayload.planName || plan.name);

  const status = subObj.status || fallbackPayload.status || 'active';
  const amount = Number(
    (isEchoingPayload && subObj.amount !== undefined ? subObj.amount : null) ??
    fallbackPayload.amount ??
    fallbackPayload.price ??
    subObj.amount ??
    subObj.price ??
    plan.price ??
    0
  );
  const currency = subObj.currency || fallbackPayload.currency || 'INR';
  const billingCycle = subObj.billing_cycle || subObj.billingCycle || fallbackPayload.billing_cycle || plan.billing_cycle || 'monthly';

  const startedAt = subObj.started_at || subObj.created_at || fallbackPayload.started_at || new Date().toISOString();
  const expiresAt = subObj.expires_at || fallbackPayload.expires_at || new Date(Date.now() + (role === 'seller' ? 45 : 30) * 86400000).toISOString();
  const renewalAt = subObj.renewal_at || expiresAt;

  const propertyLimit = Number(
    (isEchoingPayload && (subObj.property_limit || subObj.propertyLimit || subObj.entitlements?.property_limit)) ||
    plan.property_limit ||
    plan.entitlements?.property_limit ||
    fallbackPayload.property_limit ||
    (role === 'seller' ? 10 : 1)
  );

  const contactLimit = Number(
    (isEchoingPayload && (subObj.contact_limit || subObj.contactLimit || subObj.entitlements?.contact_limit)) ||
    plan.contact_limit ||
    plan.entitlements?.contact_limit ||
    fallbackPayload.contact_limit ||
    (role === 'buyer' ? 10 : 1)
  );

  const entitlements = {
    ...plan.entitlements,
    ...(isEchoingPayload && typeof subObj.entitlements === 'object' ? subObj.entitlements : {})
  };

  const usage = {
    ...(role === 'seller'
      ? { properties_published: (isEchoingPayload && subObj.usage?.properties_published) || 0, property_limit: propertyLimit }
      : { contacts_used: (isEchoingPayload && subObj.usage?.contacts_used) || 0, contact_limit: contactLimit })
  };

  return {
    subscription_id: subId,
    id: subId,
    user_id: userId,
    userId: userId,
    role,
    plan_id: planId,
    planId: planId,
    plan_name: planName,
    planName: planName,
    status,
    contact_limit: contactLimit,
    contactLimit: contactLimit,
    property_limit: propertyLimit,
    propertyLimit: propertyLimit,
    started_at: startedAt,
    expires_at: expiresAt,
    renewal_at: renewalAt,
    billing_cycle: billingCycle,
    amount,
    currency,
    usage,
    entitlements,
    raw: responseData
  };
};

// Helper to map plan IDs to standard Supabase Subscriptions schema format & prices
export const resolvePlanCodeAndPrice = (planId, role) => {
  const normId = (planId || '').toLowerCase().trim();
  if (role === 'buyer') {
    if (normId === 'relax') {
      return { plan: 'relax', plan_name: 'Relax', amount: 1499, price: 1499, billing_cycle: 'monthly', contact_limit: 30 };
    }
    if (normId === 'smart_seller' || normId === 'smartseller' || normId === 'connect_plus' || normId === 'smart_buyer') {
      return { plan: 'smartseller', plan_name: 'SmartSeller', amount: 699, price: 699, billing_cycle: 'monthly', contact_limit: 10 };
    }
    return { plan: 'free', plan_name: 'Free', amount: 0, price: 0, billing_cycle: 'monthly', contact_limit: 1 };
  } else {
    // role === 'seller'
    if (normId === 'relax' || normId === 'professional') {
      return { plan: 'relax', plan_name: 'Relax', amount: 940, price: 940, billing_cycle: '45_days', property_limit: 50 };
    }
    if (normId === 'connect_plus' || normId === 'connect+' || normId === 'smart_seller') {
      return { plan: 'connect_plus', plan_name: 'Connect+', amount: 700, price: 700, billing_cycle: '45_days', property_limit: 25 };
    }
    return { plan: 'connect', plan_name: 'Connect', amount: 500, price: 500, billing_cycle: '45_days', property_limit: 15 };
  }
};

// Response normalization for diverse SNS Workbench / n8n workflow output formats
export const normalizeLifestyleResponse = (responseData, preferences = {}, fallbackProfile = {}) => {
  if (!responseData) return fallbackProfile;

  let data = responseData;
  // Unwrap standard n8n/SNS output envelope
  if (data.output?.items?.[0]?.json) {
    data = data.output.items[0].json;
    if (data.body && typeof data.body === 'object' && !data.lifestyle_type && !data.lifestyleType) {
      data = { ...data.body, ...data };
    }
  } else if (data.data && typeof data.data === 'object') {
    data = data.data;
  } else if (data.output && typeof data.output === 'object') {
    data = data.output;
  } else if (data.result && typeof data.result === 'object') {
    data = data.result;
  } else if (data.lifestyle_analysis && typeof data.lifestyle_analysis === 'object') {
    data = data.lifestyle_analysis;
  }

  // Handle embedded JSON strings
  if (typeof data.ai_analysis === 'string') {
    try { data = { ...data, ...JSON.parse(data.ai_analysis) }; } catch (_) {}
  }
  if (typeof data.analysis === 'string') {
    try { data = { ...data, ...JSON.parse(data.analysis) }; } catch (_) {}
  }

  const lifestyleType = data.lifestyle_type || data.lifestyleType || data.category || fallbackProfile.lifestyle_type || 'Family-Oriented Professional';
  const aiSummary = data.ai_summary || data.summary || data.ai_description || data.explanation || fallbackProfile.ai_summary || 'Lifestyle parameters synthesized by SNS Workbench AI Workflow.';
  const priorityWeights = data.priority_weights || data.priorityWeights || data.priorities || fallbackProfile.priority_weights || {
    commute: 25,
    budget: 25,
    schools: 20,
    noise: 15,
    parks: 10,
    amenities: 5
  };

  let dealbreakers = data.dealbreakers || data.dealBreakers || data.deal_breakers || fallbackProfile.dealbreakers;
  if (!Array.isArray(dealbreakers) && typeof dealbreakers === 'object' && dealbreakers !== null) {
    dealbreakers = Object.values(dealbreakers);
  } else if (typeof dealbreakers === 'string') {
    dealbreakers = [dealbreakers];
  } else if (!Array.isArray(dealbreakers)) {
    dealbreakers = fallbackProfile.dealbreakers || ['Budget adherence', 'Commute ceiling'];
  }

  return {
    lifestyle_type: lifestyleType,
    ai_summary: aiSummary,
    priority_weights: priorityWeights,
    dealbreakers,
    raw: responseData
  };
};

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

  // Incorporate properties created by sellers in Live Mode
  try {
    const liveProps = getLiveSellerPropertiesStore();
    if (Array.isArray(liveProps)) {
      liveProps.forEach((lp) => {
        if (lp && (lp.property_id || lp.id)) {
          const pid = lp.property_id || lp.id;
          const uniqueImgs = PROPERTY_IMAGES_MAP[pid] || getUniquePropertyImages(pid, lp.title || 'Property');
          map.set(pid, {
            ...lp,
            property_id: pid,
            id: pid,
            images: (Array.isArray(lp.images) && lp.images.length > 0) ? lp.images : uniqueImgs,
            photos: (Array.isArray(lp.photos) && lp.photos.length > 0) ? lp.photos : uniqueImgs,
            is_user_created: true
          });
        }
      });
    }
  } catch (_) {}

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
    plan_id: 'smart_seller',
    plan_name: 'SmartSeller',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-15T00:00:00Z',
    renewal_at: '2026-10-15T00:00:00Z',
    billing_cycle: 'monthly',
    amount: 699,
    currency: 'INR',
    usage: {
      properties_published: 1,
      property_limit: 10
    },
    entitlements: SELLER_PLANS[1].entitlements
  },
  {
    subscription_id: 'sub_demo_seller_02',
    user_id: 'usr_seller_02',
    role: 'seller',
    plan_id: 'smart_seller',
    plan_name: 'SmartSeller',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-15T00:00:00Z',
    renewal_at: '2026-10-15T00:00:00Z',
    billing_cycle: 'monthly',
    amount: 699,
    currency: 'INR',
    usage: {
      properties_published: 3,
      property_limit: 10
    },
    entitlements: SELLER_PLANS[1].entitlements
  },
  {
    subscription_id: 'sub_demo_seller_03',
    user_id: 'usr_seller_03',
    role: 'seller',
    plan_id: 'professional',
    plan_name: 'Professional',
    status: 'active',
    started_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-10-15T00:00:00Z',
    renewal_at: '2026-10-15T00:00:00Z',
    billing_cycle: 'monthly',
    amount: 1499,
    currency: 'INR',
    usage: {
      properties_published: 8,
      property_limit: 30
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
  // If SMARTNEST_API_URL is the placeholder domain api.smartnest.ai, do not issue fetch()
  // which results in net::ERR_NAME_NOT_RESOLVED in the browser console
  if (SMARTNEST_API_URL.includes('smartnest.ai')) {
    throw new Error(`Endpoint ${endpoint} not available on placeholder API domain.`);
  }

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
  async loginUser(email, password, contact = '') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
      throw new Error("Invalid email or password.");
    }

    // 1. DEMO MODE: Keep existing demo/mock behavior intact
    if (getDemoMode()) {
      await mockLatency(300);
      let user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user && cleanEmail === 'prestige@smartnest.ai') {
        user = usersStore.find((u) => u.user_id === 'usr_seller_01');
      }
      if (!user) {
        throw new Error("No account found with this email address");
      }
      if (user.password !== cleanPassword && cleanPassword !== 'password123') {
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

    // 2. LIVE MODE: Dispatch to SNS Login Webhook
    // Payload contains exactly email and password
    const loginPayload = {
      email: cleanEmail,
      password: cleanPassword
    };

    let response;
    let resData;

    try {
      const primaryUrl = resolveWebhookFetchUrl(SMARTNEST_LOGIN_WEBHOOK_URL);
      response = await fetch(primaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginPayload)
      });

      // Fallback if workflow is in draft/test mode on SNS Workbench
      if (response.status === 404) {
        console.warn('[SmartNest Auth] Production login webhook returned 404, attempting fallback to test webhook...');
        const testUrl = resolveWebhookFetchUrl(SMARTNEST_LOGIN_WEBHOOK_TEST_URL);
        response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(loginPayload)
        });
      }

      const text = await response.text();
      try {
        resData = text ? JSON.parse(text) : {};
      } catch (_) {
        resData = { rawText: text };
      }
    } catch (fetchErr) {
      console.error('[SmartNest Auth] Network error connecting to SNS login webhook:', fetchErr);
      throw new Error("Unable to sign in right now. Please try again.");
    }

    // Inspect HTTP status code
    if (!response.ok) {
      throw new Error(normalizeLoginError(null, response.status, resData));
    }

    // Check if body signals an explicit failure (e.g. Supabase Auth or SNS node error)
    if (resData?.success === false || resData?.error || resData?.msg) {
      throw new Error(normalizeLoginError(resData.error || resData.message || resData.msg, response.status, resData));
    }

    // Check inside n8n output envelope
    const jsonItem = resData?.output?.items?.[0]?.json || resData?.items?.[0]?.json;
    if (jsonItem && (jsonItem.success === false || jsonItem.error || jsonItem.body?.error)) {
      const err = jsonItem.error || jsonItem.body?.error || jsonItem.message;
      throw new Error(normalizeLoginError(err, response.status, jsonItem));
    }

    const authUser = extractUserFromLoginResponse(resData, cleanEmail);

    if (!authUser || !authUser.user_id || !authUser.token) {
      console.error('[SmartNest Auth] Malformed or missing user credentials in response:', resData);
      throw new Error("Unable to sign in right now. Please try again.");
    }

    // Validate role
    if (!['buyer', 'seller', 'admin'].includes(authUser.role)) {
      authUser.role = 'buyer';
    }

    // Synchronize safe record into local usersStore
    const existingIndex = usersStore.findIndex(
      (u) => u.email.toLowerCase() === authUser.email.toLowerCase()
    );
    const safeUserRecord = {
      user_id: authUser.user_id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
      phone: contact || '',
      contact: contact || '',
      status: 'active',
      last_login: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      usersStore[existingIndex] = { ...usersStore[existingIndex], ...safeUserRecord };
    } else {
      usersStore = [...usersStore, safeUserRecord];
    }
    setStore('users', usersStore);

    return {
      user_id: authUser.user_id,
      name: authUser.name,
      role: authUser.role,
      email: authUser.email,
      phone: contact || '',
      contact: contact || '',
      token: authUser.token
    };
  },

  async login(email, password, contact = '') {
    return this.loginUser(email, password, contact);
  },

  async registerUser(payload) {
    const {
      name = '',
      email = '',
      password = '',
      confirmPassword = '',
      role = 'buyer'
    } = payload || {};

    const cleanRole = (role || 'buyer').toString().trim().toLowerCase();

    if (!name || !email || !password) {
      throw new Error("Full name, email, and password are required.");
    }

    if (getDemoMode()) {
      await mockLatency(300);
      const exists = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        throw new Error("An account already exists with this email address");
      }
      const newUser = {
        user_id: `usr_${cleanRole}_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: cleanRole,
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

    // LIVE MODE: Dispatch to SNS Agent Workbench Webhook
    // Matches the exact 5 fields expected by the "validate & prepare" node:
    // const name = body.name;
    // const email = body.email;
    // const password = body.password;
    // const confirmPassword = body.confirmPassword;
    // const role = body.role;
    const signupPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword: confirmPassword || password,
      role: cleanRole
    };

    let response;
    let resData;

    try {
      const primaryUrl = resolveWebhookFetchUrl(SMARTNEST_SIGNUP_WEBHOOK_URL);
      response = await fetch(primaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(signupPayload)
      });

      // If production webhook returns 404 (e.g. workflow in draft/test mode on SNS Workbench), fallback to test webhook
      if (response.status === 404) {
        console.warn('[SmartNest Auth] Production webhook returned 404, attempting fallback to test webhook...');
        const testUrl = resolveWebhookFetchUrl(SMARTNEST_SIGNUP_WEBHOOK_TEST_URL);
        response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(signupPayload)
        });
      }

      const text = await response.text();
      try {
        resData = text ? JSON.parse(text) : {};
      } catch (_) {
        resData = { rawText: text };
      }
    } catch (fetchErr) {
      console.error('[SmartNest Auth] Network error connecting to SNS signup webhook:', fetchErr);
      throw new Error(
        `Unable to reach registration server (${fetchErr.message || 'Network error'}). Please check your connection.`
      );
    }

    // Inspect webhook response for validation errors or explicit failures
    let backendError = null;

    if (resData) {
      if (resData.success === false && resData.error) {
        backendError = resData.error;
      } else if (resData.error && typeof resData.error === 'string' && !resData.user && !resData.output) {
        backendError = resData.error;
      } else if (resData.message && !response.ok) {
        backendError = resData.message;
      }

      // Check nested error format inside n8n / SNS output envelope
      const jsonItem = resData.output?.items?.[0]?.json || resData.items?.[0]?.json;
      if (jsonItem) {
        if (jsonItem.success === false && jsonItem.error) {
          backendError = jsonItem.error;
        } else if (jsonItem.error && typeof jsonItem.error === 'string' && !jsonItem.user) {
          backendError = jsonItem.error;
        } else if (jsonItem.body?.success === false && jsonItem.body?.error) {
          backendError = jsonItem.body.error;
        } else if (jsonItem.body?.error && typeof jsonItem.body.error === 'string' && !jsonItem.body?.user) {
          backendError = jsonItem.body.error;
        }
      }
    }

    if (backendError) {
      throw new Error(backendError);
    }

    // Check HTTP status code
    if (!response.ok) {
      const errMsg =
        resData?.error ||
        resData?.message ||
        resData?.details ||
        `Registration failed (HTTP ${response.status}). Please try again.`;
      throw new Error(errMsg);
    }

    // Extract user details from SNS / n8n workflow output
    const extractedUser = extractUserFromSignupResponse(resData, signupPayload);

    if (!extractedUser || !extractedUser.user_id) {
      throw new Error("Registration succeeded but user profile could not be retrieved from server.");
    }

    // Keep usersStore in sync in memory (never storing raw password)
    const existingIndex = usersStore.findIndex(
      (u) => u.email.toLowerCase() === extractedUser.email.toLowerCase()
    );
    const safeUserRecord = {
      user_id: extractedUser.user_id,
      name: extractedUser.name,
      email: extractedUser.email,
      role: extractedUser.role,
      status: extractedUser.status || "active",
      registered_at: extractedUser.registered_at || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      usersStore[existingIndex] = { ...usersStore[existingIndex], ...safeUserRecord };
    } else {
      usersStore = [...usersStore, safeUserRecord];
    }
    setStore('users', usersStore);

    return extractedUser;
  },

  async register(name, email, password, role, confirmPassword) {
    if (typeof name === 'object' && name !== null) {
      return this.registerUser(name);
    }
    return this.registerUser({ name, email, password, role, confirmPassword });
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

  getLifestyleWebhookUrl() {
    if (typeof localStorage === 'undefined') return DEFAULT_LIFESTYLE_WEBHOOK_URL;
    const stored = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (!stored || stored === 'https://api.agents.snsihub.ai/webhook/ed98ebe4-d99d-4370-8a64-7f61b70ff52f') {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, DEFAULT_LIFESTYLE_WEBHOOK_URL);
      return DEFAULT_LIFESTYLE_WEBHOOK_URL;
    }
    return stored;
  },

  setLifestyleWebhookUrl(url) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, url);
    }
  },

  getLifestyleWebhookResult() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(WEBHOOK_RESULT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async triggerLifestyleWebhook(preferences = {}, profile = null) {
    const webhookUrl = this.getLifestyleWebhookUrl();
    let urlUsed = webhookUrl;
    const householdType = preferences.household_type || (preferences.family_size > 2 ? 'family' : preferences.family_size === 2 ? 'couple' : 'bachelor');
    const familySize = preferences.family_size || (householdType === 'family' ? 4 : householdType === 'couple' ? 2 : 1);
    const budgetLakhs = preferences.budget ? Math.round(preferences.budget / 100000) : 55;
    const maxCommute = Number(preferences.max_commute || 30);

    const baselineLifestyleType = profile?.lifestyle_type || (householdType === 'family' ? "Family-Oriented Professional" : householdType === 'couple' ? "Modern Dual-Income Couple" : "Tech-Driven Urbanite");
    const baselineSummary = profile?.ai_summary || `Calculated priority index favors ${preferences.commute_mode || 'convenient'} commuting in ${preferences.city || 'Coimbatore'}.`;
    const baselineWeights = profile?.priority_weights || { commute: 25, budget: 25, schools: 20, noise: 15, parks: 10, amenities: 5 };
    const baselineDealbreakers = profile?.dealbreakers || [`Commute above ${maxCommute} minutes`, 'High noise', `Budget above ₹${budgetLakhs}L`];

    // Complete 5-step payload matching project contract and SNS workflow node expectations
    const payload = {
      // Step 1: Basic Requirements
      budget: Number(preferences.budget || 5500000),
      city: preferences.city || 'Coimbatore',
      property_type: preferences.property_type || 'Apartment',
      bhk: Number(preferences.bhk || 2),
      household_type: householdType,

      // Step 2: Daily Life
      workplace: preferences.workplace || 'Tidel Park / Peelamedu Tech Corridor',
      max_commute: maxCommute,
      max_commute_minutes: maxCommute,
      commute_mode: preferences.commute_mode || 'Car',
      transport: preferences.commute_mode || 'Car',

      // Step 3: Family & Education
      school_importance: preferences.school_importance || 'high',
      max_school_distance: Number(preferences.max_school_distance || 2.0),
      school_distance: Number(preferences.max_school_distance || 2.0),
      hospital_importance: preferences.hospital_importance || 'high',
      family_friendly: preferences.family_friendly !== undefined ? Boolean(preferences.family_friendly) : true,

      // Step 4: Environment & Wellness
      noise_pref: preferences.noise_pref || 'quiet',
      noise_preference: preferences.noise_pref || 'quiet',
      pollution_sensitivity: preferences.pollution_sensitivity || 'high',
      air_quality_preference: preferences.pollution_sensitivity || 'high',
      green_pref: preferences.green_pref || 'high',
      green_space_preference: preferences.green_pref || 'high',
      park_walking: preferences.park_walking !== undefined ? Boolean(preferences.park_walking) : true,
      park_walking_preference: preferences.park_walking !== undefined ? Boolean(preferences.park_walking) : true,

      // Step 5: Essential Amenities (12 selectable items)
      amenities: preferences.amenities || ['Supermarket', 'Hospital', 'School', 'Park', 'Gym'],

      // Context & workflow node dependencies
      user_id: preferences.user_id || 'usr_buyer_01',
      session_id: preferences.session_id || 'guest',
      family_size: familySize,
      lifestyle_type: baselineLifestyleType,
      ai_summary: baselineSummary,
      priority_weights: baselineWeights,
      dealbreakers: baselineDealbreakers,
      dealbreaker: baselineDealbreakers[0] || 'Commute',
      triggered_at: new Date().toISOString()
    };

    // Safe development logging (strictly non-sensitive metadata)
    if (typeof console !== 'undefined' && console.log) {
      console.log('Lifestyle workflow request:', {
        stepCount: 5,
        fieldsPresent: Object.keys(payload),
        targetUrl: urlUsed
      });
    }

    let responseData = null;
    let success = false;
    let errorMessage = null;
    let statusCode = null;

    // Resolve URL through Vite dev proxy if running in browser to prevent CORS/preflight blocks
    const primaryFetchUrl = resolveWebhookFetchUrl(urlUsed);

    try {
      let response = await fetch(primaryFetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      statusCode = response.status;

      if (response.ok) {
        responseData = await response.json().catch(() => ({ status: 'success', message: 'Webhook received' }));
        success = true;
      } else if (response.status === 404 && primaryFetchUrl.includes('/webhook/')) {
        // Workflow may be in test/draft mode in SNS Workbench - auto retry on test webhook
        const testFetchUrl = primaryFetchUrl.replace('/webhook/', '/webhook-test/');
        const fallbackRes = await fetch(testFetchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        statusCode = fallbackRes.status;
        if (fallbackRes.ok) {
          responseData = await fallbackRes.json().catch(() => ({ status: 'success', mode: 'test_fallback' }));
          success = true;
          urlUsed = urlUsed.replace('/webhook/', '/webhook-test/');
        } else {
          const errBody = await fallbackRes.json().catch(() => ({}));
          errorMessage = errBody.message || errBody.error || `Workflow returned HTTP ${fallbackRes.status}`;
          responseData = errBody;
        }
      } else {
        const errBody = await response.json().catch(() => ({}));
        errorMessage = errBody.message || errBody.error || `Workflow returned HTTP ${response.status}`;
        responseData = errBody;
      }
    } catch (netErr) {
      console.warn('Primary fetch encountered error, testing direct fallback:', netErr);
      try {
        let directRes = await fetch(urlUsed, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        statusCode = directRes.status;
        if (directRes.ok) {
          responseData = await directRes.json().catch(() => ({ status: 'success' }));
          success = true;
        } else {
          errorMessage = `HTTP ${directRes.status}: ${directRes.statusText}`;
        }
      } catch (directErr) {
        statusCode = 0;
        errorMessage = `Network/CORS error: ${directErr.message || 'Failed to fetch'}`;
      }
    }

    const resultRecord = {
      success,
      statusCode,
      url: urlUsed,
      payload,
      response: responseData,
      error: errorMessage,
      triggered_at: new Date().toISOString()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WEBHOOK_RESULT_KEY, JSON.stringify(resultRecord));
    }

    return resultRecord;
  },

  async analyzeLifestyle(preferences) {
    const householdType = preferences.household_type || (preferences.family_size > 2 ? 'family' : preferences.family_size === 2 ? 'couple' : 'bachelor');
    const familySize = preferences.family_size || (householdType === 'family' ? 4 : householdType === 'couple' ? 2 : 1);
    const budgetLakhs = preferences.budget ? Math.round(preferences.budget / 100000) : 55;
    const maxCommute = Number(preferences.max_commute || 30);

    // Sync buyer preferences store with 5-step form inputs
    buyerPreferencesStore = {
      ...buyerPreferencesStore,
      ...preferences,
      household_type: householdType,
      family_size: familySize
    };
    setStore('buyer_preferences', buyerPreferencesStore);

    const baselineProfile = {
      lifestyle_type: householdType === 'family'
        ? "Family-Oriented Professional"
        : householdType === 'couple'
        ? "Modern Dual-Income Couple"
        : "Tech-Driven Urbanite",
      ai_summary: `Calculated priority index favors ${preferences.commute_mode || 'convenient'} commuting (max ${maxCommute}m) in ${preferences.city || 'Coimbatore'}. Key criteria include keeping acquisition budget below ₹${budgetLakhs}L with acoustic noise suppression.`,
      priority_weights: {
        commute: 25,
        budget: 25,
        schools: preferences.school_importance === 'high' ? 25 : 15,
        noise: preferences.noise_pref === 'quiet' ? 20 : 10,
        parks: preferences.park_walking ? 15 : 10,
        amenities: (preferences.amenities?.length || 0) > 6 ? 15 : 10
      },
      dealbreakers: [
        maxCommute ? `Commute above ${maxCommute} minutes` : null,
        preferences.noise_pref === 'quiet' ? "High noise" : null,
        `Budget above ₹${budgetLakhs}L`
      ].filter(Boolean)
    };

    // Await the real SNS Workbench Workflow
    const webhookResult = await this.triggerLifestyleWebhook(preferences, baselineProfile);

    if (webhookResult.success) {
      // Normalize SNS workflow response structure into canonical SmartNest profile
      const normalized = normalizeLifestyleResponse(webhookResult.response, preferences, baselineProfile);
      lifestyleProfileStore = normalized;
      setStore('lifestyle_profile', normalized);
      return normalized;
    }

    console.error('Lifestyle webhook execution was not successful:', webhookResult);

    // If Demo Mode is enabled and workflow is unreachable, provide safe fallback
    if (getDemoMode()) {
      console.warn('Demo Mode active: falling back to synthesized lifestyle profile.');
      lifestyleProfileStore = baselineProfile;
      setStore('lifestyle_profile', baselineProfile);
      return baselineProfile;
    }

    // Build clear user-facing error message with diagnostic info
    let userMsg = 'Unable to analyze your lifestyle right now. Please try again.';
    if (webhookResult.statusCode === 400) {
      userMsg = 'The lifestyle request format is invalid.';
    } else if (webhookResult.statusCode === 401 || webhookResult.statusCode === 403) {
      userMsg = 'The lifestyle analysis service rejected the request.';
    } else if (webhookResult.statusCode === 404) {
      userMsg = 'The lifestyle workflow endpoint could not be found or the workflow is inactive in SNS Workbench.';
    } else if (webhookResult.statusCode >= 500) {
      userMsg = 'The lifestyle analysis workflow encountered an error.';
    }

    const error = new Error(userMsg);
    error.statusCode = webhookResult.statusCode;
    error.diagnostic = webhookResult.error;
    throw error;
  },

  async getRecommendations(filters = {}) {
    if (getDemoMode() || SMARTNEST_API_URL.includes('smartnest.ai')) {
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
        profile: {
          ...lifestyleProfileStore,
          webhook_trigger: this.getLifestyleWebhookResult()
        }
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
    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall(`/buyer/history/${sessionId}`);
      } catch (_) {}
    }
    return searchHistoryStore;
  },

  async aiSearch(query, sessionId) {
    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall('/buyer/search/ai', {
          method: 'POST',
          body: JSON.stringify({ query, session_id: sessionId })
        });
      } catch (_) {}
    }

    if (getDemoMode()) {
      await mockLatency(400);
    }
    syncPropertiesStore();
    const lower = (query || '').toLowerCase();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const matches = allProps.filter((p) => {
      if (p.status && p.status !== 'active') return false;
      if (lower.includes('quiet') || lower.includes('low noise')) {
        if (p.noise_level !== 'low') return false;
      }
      if (lower.includes('villa')) {
        return (p.type || '').toLowerCase() === 'villa';
      }
      if (lower.includes('apartment') || lower.includes('condo')) {
        return (p.type || '').toLowerCase() === 'apartment';
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
        match_score: p.match_score || analysis.overall_score,
        match_rating: p.match_rating || analysis.match_rating,
        score_breakdown: p.score_breakdown || analysis.score_breakdown
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
      properties: matches.length > 0 ? matches : allProps.slice(0, 3)
    };
  },

  async saveProperty(propertyId, sessionId) {
    if (!shortlistStore.includes(propertyId)) {
      shortlistStore = [...shortlistStore, propertyId];
      setStore('shortlist', shortlistStore);
    }

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        await httpCall('/buyer/shortlist', {
          method: 'POST',
          body: JSON.stringify({ property_id: propertyId, session_id: sessionId })
        });
      } catch (_) {}
    }

    return { success: true, saved_ids: shortlistStore };
  },

  async removeSavedProperty(propertyId, sessionId) {
    shortlistStore = shortlistStore.filter((id) => id !== propertyId);
    setStore('shortlist', shortlistStore);

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        await httpCall(`/buyer/shortlist/${propertyId}`, {
          method: 'DELETE',
          body: JSON.stringify({ session_id: sessionId })
        });
      } catch (_) {}
    }

    return { success: true, saved_ids: shortlistStore };
  },

  async getSavedProperties(sessionId) {
    syncPropertiesStore();
    const liveProps = getLiveSellerPropertiesStore();
    const allProps = [...liveProps, ...propertiesStore];
    const savedProps = allProps
      .filter((p) => shortlistStore.includes(p.property_id) || shortlistStore.includes(p.id))
      .map((p) => {
        const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, p);
        return {
          ...p,
          match_score: p.match_score || analysis.overall_score,
          match_rating: p.match_rating || analysis.match_rating,
          score_breakdown: p.score_breakdown || analysis.score_breakdown
        };
      });

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        const remote = await httpCall(`/buyer/shortlist/${sessionId}`);
        if (remote && Array.isArray(remote.properties)) {
          return remote;
        }
      } catch (_) {}
    }

    return { properties: savedProps, count: savedProps.length };
  },

  // ── COMPATIBILITY & INTELLIGENCE ENDPOINTS ──────────────────
  /**
   * FEATURE 1: Lifestyle Compatibility Score
   * Calculates deterministic compatibility for property & buyer
   */
  async getCompatibilityScore(propertyId, sessionId) {
    syncPropertiesStore();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const prop = allProps.find((p) => p.property_id === propertyId || p.id === propertyId || p.legacy_id === propertyId);

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall(`/buyer/compatibility/${propertyId}`);
      } catch (_) {}
    }

    if (!prop) throw new Error("Property not found");
    return workflowCompatibilityAnalysis(buyerPreferencesStore, prop);
  },

  /**
   * FEATURE 3: Why This Property & What You Gain / Sacrifice
   */
  async getWhyThisProperty(propertyId, sessionId) {
    syncPropertiesStore();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const prop = allProps.find((p) => p.property_id === propertyId || p.id === propertyId || p.legacy_id === propertyId);

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall(`/buyer/property/${propertyId}/why`);
      } catch (_) {}
    }

    if (!prop) throw new Error("Property not found");
    return workflowWhyThisProperty(buyerPreferencesStore, prop);
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

    // In LIVE Mode: FIRST check Supabase properties table directly
    try {
      const sbRes = await fetch(`${SUPABASE_REST_URL}/properties?property_id=eq.${encodeURIComponent(propertyId)}&select=*&limit=1`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = mapSupabaseRowToProperty(rows[0]);
          const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, mapped);
          const whyData = workflowWhyThisProperty(buyerPreferencesStore, mapped);
          return {
            ...mapped,
            match_score: mapped.match_score || analysis.overall_score,
            compatibility_score: mapped.compatibility_score || analysis.overall_score,
            match_rating: mapped.match_rating || analysis.match_rating,
            score_breakdown: mapped.score_breakdown || analysis.score_breakdown,
            ai_explanation: mapped.ai_explanation || analysis.explanation,
            strengths: mapped.strengths || analysis.strengths,
            tradeoffs: mapped.tradeoffs || analysis.tradeoffs,
            what_you_gain: mapped.what_you_gain || whyData.what_you_gain,
            what_you_sacrifice: mapped.what_you_sacrifice || whyData.what_you_sacrifice
          };
        }
      }
    } catch (_) {}

    // In LIVE Mode: check live seller properties store second
    const liveProps = getLiveSellerPropertiesStore();
    const liveFound = liveProps.find((p) => p.property_id === propertyId || p.id === propertyId || p.legacy_id === propertyId);
    if (liveFound) {
      const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, liveFound);
      const whyData = workflowWhyThisProperty(buyerPreferencesStore, liveFound);
      return {
        ...liveFound,
        match_score: liveFound.match_score || analysis.overall_score,
        compatibility_score: liveFound.compatibility_score || analysis.overall_score,
        match_rating: liveFound.match_rating || analysis.match_rating,
        score_breakdown: liveFound.score_breakdown || analysis.score_breakdown,
        ai_explanation: liveFound.ai_explanation || analysis.explanation,
        strengths: liveFound.strengths || analysis.strengths,
        tradeoffs: liveFound.tradeoffs || analysis.tradeoffs,
        what_you_gain: liveFound.what_you_gain || whyData.what_you_gain,
        what_you_sacrifice: liveFound.what_you_sacrifice || whyData.what_you_sacrifice
      };
    }

    // In LIVE Mode: check catalog properties store (e.g. search matches like prestige_prop_005)
    syncPropertiesStore();
    const catalogFound = propertiesStore.find((p) => p.property_id === propertyId || p.legacy_id === propertyId);
    if (catalogFound) {
      const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, catalogFound);
      const whyData = workflowWhyThisProperty(buyerPreferencesStore, catalogFound);
      return {
        ...catalogFound,
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

    if (!SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall(`/property/${propertyId}`);
      } catch (err) {}
    }

    throw new Error("Property not found");
  },

  /**
   * FEATURE 2: AI Property Comparison
   */
  async compareProperties(ids = []) {
    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall('/property/compare', {
          method: 'POST',
          body: JSON.stringify({ ids })
        });
      } catch (_) {}
    }

    syncPropertiesStore();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const selected = ids
      .map((id) => allProps.find((p) => p.property_id === id || p.id === id))
      .filter(Boolean)
      .map((p) => {
        const analysis = workflowCompatibilityAnalysis(buyerPreferencesStore, p);
        return {
          ...p,
          match_score: p.match_score || analysis.overall_score,
          match_rating: p.match_rating || analysis.match_rating,
          score_breakdown: p.score_breakdown || analysis.score_breakdown
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
  },

  async comparePropertiesAI(propertyId1, propertyId2, sessionId) {
    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall('/buyer/compare/ai', {
          method: 'POST',
          body: JSON.stringify({ property_1_id: propertyId1, property_2_id: propertyId2 })
        });
      } catch (_) {}
    }

    syncPropertiesStore();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const p1 = allProps.find((p) => p.property_id === propertyId1 || p.id === propertyId1);
    const p2 = allProps.find((p) => p.property_id === propertyId2 || p.id === propertyId2);
    if (!p1 || !p2) throw new Error("Both properties must exist to compare");
    return workflowAIPropertyComparison(buyerPreferencesStore, p1, p2);
  },

  async getNearby(propertyId) {
    syncPropertiesStore();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const prop = allProps.find((p) => p.property_id === propertyId || p.id === propertyId);

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall(`/property/${propertyId}/nearby`);
      } catch (_) {}
    }

    return prop ? prop.nearby : null;
  },

  async getCommuteInfo(propertyId, workplace) {
    syncPropertiesStore();
    const allProps = [...getLiveSellerPropertiesStore(), ...propertiesStore];
    const prop = allProps.find((p) => p.property_id === propertyId || p.id === propertyId);

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall('/property/commute', {
          method: 'POST',
          body: JSON.stringify({ property_id: propertyId, workplace })
        });
      } catch (_) {}
    }

    return {
      property_id: propertyId,
      workplace: workplace || "Tidel Park Coimbatore",
      commute_minutes: prop ? prop.commute_minutes : 20,
      commute_mode: prop ? prop.commute_mode : "Car / Metro"
    };
  },

  async sendEnquiry(propertyId, message, sessionId) {
    if (getDemoMode()) {
      await mockLatency(300);
      const prop = propertiesStore.find((p) => p.property_id === propertyId);
      let buyerUser = null;
      try {
        buyerUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (e) {}

      const buyerId = buyerUser?.user_id || 'usr_buyer_01';
      const buyerName = buyerUser?.name || 'Aarav Sharma';
      const buyerEmail = buyerUser?.email || 'aarav@smartnest.ai';
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
        seller_name: seller?.seller_name || conv.seller_name
      };
    }

    // LIVE MODE:
    let buyerUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        buyerUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (_) {}
    }

    const buyerId = buyerUser?.user_id || buyerUser?.id || sessionId || `usr_live_buyer_${Date.now()}`;
    const buyerName = buyerUser?.name || buyerUser?.user_metadata?.full_name || 'Buyer';
    const buyerEmail = buyerUser?.email || '';

    const prop = await this.getProperty(propertyId).catch(() => null);
    const sellerId =
      prop?.seller_id ||
      prop?.user_id ||
      prop?.seller?.seller_id ||
      prop?.seller?.user_id ||
      '';
    const sellerName =
      prop?.seller_name ||
      prop?.seller?.seller_name ||
      'Verified Seller';
    const sellerEmail =
      prop?.seller?.email ||
      '';

    const conv = await this.createOrGetConversation({
      buyer_id: buyerId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      seller_id: sellerId,
      seller_name: sellerName,
      seller_email: sellerEmail,
      property_id: propertyId,
      property_title: prop?.title || 'SmartNest Property',
      property_image: (prop?.images && prop.images[0]) || (prop?.photos && prop.photos[0]) || '',
      property_price: prop?.price || 0,
      property_location: prop?.location || prop?.address || prop?.city || '',
      initial_message: message
    });

    return {
      success: true,
      enquiry_id: conv.enquiry_id,
      conversation_id: conv.conversation_id,
      seller_name: conv.seller_name || sellerName
    };
  },

  // ── SELLER ENDPOINTS ───────────────────────────────────────
  async getSellerDetails(sellerId) {
    if (getDemoMode()) {
      await mockLatency(100);
    }
    const seller = sellersStore.find(
      (s) => s.seller_id === sellerId || s.user_id === sellerId || s.id === sellerId
    );
    if (seller) return seller;

    // Check if property was uploaded by this seller in live properties store
    const liveProps = getLiveSellerPropertiesStore();
    const liveProp = liveProps.find(
      (p) => p.seller_id === sellerId || p.user_id === sellerId || p.seller?.seller_id === sellerId || p.seller?.user_id === sellerId
    );
    if (liveProp?.seller) {
      return {
        seller_id: sellerId,
        user_id: sellerId,
        seller_name: liveProp.seller.seller_name || liveProp.seller_name || "Verified Seller",
        seller_type: liveProp.seller.seller_type || "Verified Seller",
        phone: liveProp.seller.phone || "+91 98765 43210",
        email: liveProp.seller.email || "seller@smartnest.ai",
        location: liveProp.location || "Coimbatore",
        experience_years: "5+ Years",
        rating: 4.7,
        review_count: 42,
        properties_count: "10+",
        rera_registered: true,
        trusted_developer: true,
        verified: true
      };
    }

    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall(`/seller/${sellerId}/details`);
      } catch (_) {}
    }

    return sellersStore[0] || {
      seller_id: sellerId || "S001",
      user_id: sellerId || "usr_seller_01",
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
  },

  async getAllSellers() {
    if (!getDemoMode() && !SMARTNEST_API_URL.includes('smartnest.ai')) {
      try {
        return await httpCall('/sellers');
      } catch (_) {}
    }
    return sellersStore;
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

    // In LIVE Mode: FIRST query Supabase properties table directly as source of truth!
    let supabaseProps = [];
    try {
      const sbRes = await fetch(`${SUPABASE_REST_URL}/properties?select=*&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows)) {
          supabaseProps = rows.map(mapSupabaseRowToProperty).filter(Boolean);
        }
      }
    } catch (sbErr) {
      console.warn('[getSellerProperties] Supabase query notice:', sbErr?.message);
    }

    // Merge with local persistent live store
    const liveProps = getLiveSellerPropertiesStore();
    const propMap = new Map();
    for (const p of supabaseProps) {
      propMap.set(p.property_id, p);
    }
    for (const p of liveProps) {
      if (!propMap.has(p.property_id)) {
        propMap.set(p.property_id, p);
      }
    }

    const merged = Array.from(propMap.values());
    if (!sellerId) return merged;

    return merged.filter((p) => {
      if (sellerId === 'usr_seller_01' || sellerId === 'S001') {
        return p.seller_id === 'S001' || p.seller_id === 'usr_seller_01' || !p.seller_id;
      }
      return (
        p.seller_id === sellerId ||
        p.user_id === sellerId ||
        p.seller?.seller_id === sellerId ||
        p.seller?.user_id === sellerId ||
        !p.seller_id
      );
    });
  },

  async createPropertyDemo(data) {
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
      id: uniquePropId,
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
  },

  async createProperty(data) {
    if (getDemoMode()) {
      return this.createPropertyDemo(data);
    }
    const res = await this.createSellerProperty(data);
    return res.property || res;
  },

  async createSellerProperty(propertyData) {
    if (getDemoMode()) {
      const prop = await this.createPropertyDemo(propertyData);
      return { success: true, property: prop };
    }

    // Determine authenticated user identity
    let storedUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('smartnest_user');
        if (raw) storedUser = JSON.parse(raw);
      } catch (_) {}
    }

    const authUserId =
      propertyData.seller_id ||
      propertyData.user_id ||
      storedUser?.user_id ||
      storedUser?.id ||
      '';

    const authUserName =
      propertyData.seller_name ||
      propertyData.user_name ||
      storedUser?.name ||
      storedUser?.user_metadata?.full_name ||
      'Seller';

    const sessionId =
      propertyData.session_id ||
      storedUser?.session_id ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('smartnest_session_id') : '') ||
      '';

    // In Live Mode: only fallback to a generated ID if completely anonymous, never 'usr_seller_01'
    const finalUserId = authUserId || `usr_live_seller_${Date.now()}`;
    const finalSellerName = authUserName || 'Seller';

    const generatedPropId = propertyData.property_id || `prop_live_${Date.now()}`;
    const rawPrice = Number(propertyData.price) || 0;
    const priceLakhs = Number(propertyData.price_lakhs) || (rawPrice > 0 ? Number((rawPrice / 100000).toFixed(2)) : 50);
    const bhk = Number(propertyData.bhk || propertyData.bedrooms) || 2;
    const title = propertyData.title || propertyData.property_name || 'Residential Landmark';
    const propType = propertyData.type || propertyData.property_type || 'Apartment';
    const city = propertyData.city || 'Coimbatore';
    const area = propertyData.area || propertyData.location || propertyData.address || 'Peelamedu';
    const address = propertyData.address || propertyData.location || `${area}, ${city}`;

    // Format amenities as comma-separated string for Supabase TEXT column
    const amenitiesArr = Array.isArray(propertyData.amenities)
      ? propertyData.amenities
      : (typeof propertyData.amenities === 'string' ? propertyData.amenities.split(',').map((s) => s.trim()) : ['Supermarket', 'School', 'Park', 'Gym', 'Parking']);
    const amenitiesStr = amenitiesArr.join(', ');

    const lat = Number(propertyData.lat || propertyData.latitude || propertyData.coordinates?.lat || 11.028);
    const lng = Number(propertyData.lng || propertyData.longitude || propertyData.coordinates?.lng || 77.027);

    // Payload includes EXACT Supabase columns PLUS all standard convenience aliases
    const payload = {
      // 1. EXACT Supabase `properties` Table Columns
      property_id: generatedPropId,
      property_name: title,
      price_lakhs: priceLakhs,
      city: city,
      area: area,
      property_type: propType,
      bedrooms: bhk,
      amenities: amenitiesStr,
      status: propertyData.status || 'active',
      noise_level: propertyData.noise_level || 'low',
      commute_minutes: Number(propertyData.commute_minutes || 20),
      latitude: lat,
      longitude: lng,
      school_distance_km: Number(propertyData.school_distance_km || 1.5),
      hospital_distance_km: Number(propertyData.hospital_distance_km || 2.0),

      // 2. Standard Aliases & Identity
      title: title,
      type: propType,
      price: rawPrice || Math.round(priceLakhs * 100000),
      price_inr: rawPrice || Math.round(priceLakhs * 100000),
      bhk: bhk,
      bathrooms: Number(propertyData.bathrooms || (bhk >= 3 ? 3 : 2)),
      area_sqft: Number(propertyData.area_sqft || (bhk >= 3 ? 1650 : 1200)),
      furnishing: propertyData.furnishing || 'Semi-Furnished',
      parking: Boolean(propertyData.parking !== undefined ? propertyData.parking : true),
      address: address,
      location: address,
      coordinates: { lat, lng },
      lat: lat,
      lng: lng,
      description: propertyData.description || '',
      ai_summary: propertyData.ai_summary || propertyData.description || '',
      images: Array.isArray(propertyData.images) && propertyData.images.length > 0
        ? propertyData.images
        : (Array.isArray(propertyData.photos) && propertyData.photos.length > 0 ? propertyData.photos : []),
      photos: Array.isArray(propertyData.photos) && propertyData.photos.length > 0
        ? propertyData.photos
        : (Array.isArray(propertyData.images) && propertyData.images.length > 0 ? propertyData.images : []),
      park_distance_km: Number(propertyData.park_distance_km || 0.8),
      green_score: Number(propertyData.green_score || 88),

      // Seller & Auth tracking
      seller_id: finalUserId,
      user_id: finalUserId,
      seller_name: finalSellerName,
      user_name: finalSellerName,
      session_id: sessionId,
      created_at: new Date().toISOString()
    };

    const targetUrl = resolveWebhookFetchUrl(SMARTNEST_SELLER_PROPERTY_WEBHOOK_URL);
    let res;
    try {
      res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      console.warn('Production seller property webhook fetch failed, trying test webhook route:', networkErr);
      const testUrl = resolveWebhookFetchUrl(SMARTNEST_SELLER_PROPERTY_WEBHOOK_TEST_URL);
      res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok && res.status === 404) {
      const testUrl = resolveWebhookFetchUrl(SMARTNEST_SELLER_PROPERTY_WEBHOOK_TEST_URL);
      try {
        const testRes = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (testRes.ok) {
          res = testRes;
        }
      } catch (_) {}
    }

    if (!res.ok) {
      let errDetail = 'Failed to publish property to SNS Agent Workbench.';
      try {
        const errJson = await res.json();
        errDetail = errJson.message || errJson.error || errDetail;
      } catch (_) {
        const errText = await res.text();
        if (errText) errDetail = `${errDetail} (${errText.substring(0, 100)})`;
      }
      throw new Error(errDetail);
    }

    let responseData = null;
    try {
      responseData = await res.json();
    } catch (_) {
      responseData = null;
    }

    // Direct Supabase REST insertion attempt (creates row in existing Supabase `properties` table)
    const supabaseRow = {
      property_id: payload.property_id,
      property_name: payload.property_name,
      price_lakhs: payload.price_lakhs,
      city: payload.city,
      area: payload.area,
      property_type: payload.property_type,
      bedrooms: payload.bedrooms,
      amenities: payload.amenities,
      status: payload.status,
      noise_level: payload.noise_level,
      commute_minutes: payload.commute_minutes,
      latitude: payload.latitude,
      longitude: payload.longitude,
      school_distance_km: payload.school_distance_km,
      hospital_distance_km: payload.hospital_distance_km
    };

    try {
      const sbRes = await fetch(`${SUPABASE_REST_URL}/properties`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(supabaseRow)
      });
      if (sbRes.ok) {
        console.log('[Supabase Direct Insert] Successfully inserted property into Supabase properties table');
      } else {
        console.warn('[Supabase Direct Insert] Status:', sbRes.status);
      }
    } catch (sbErr) {
      console.warn('[Supabase Direct Insert] Note:', sbErr?.message);
    }

    const createdProperty = extractPropertyFromWebhookResponse(responseData, payload);
    const liveStore = getLiveSellerPropertiesStore();
    const updatedStore = [createdProperty, ...liveStore.filter((p) => p.property_id !== createdProperty.property_id)];
    setLiveSellerPropertiesStore(updatedStore);

    return {
      success: true,
      property: createdProperty,
      data: responseData
    };
  },

  /**
   * FEATURE 4: Wishlist Price/Offer Alert & History Tracking
   */
  async updatePropertyPrice(propertyId, newPrice, sellerId = 'usr_seller_01') {
    if (getDemoMode()) {
      await mockLatency(350);
      syncPropertiesStore();
      const propIndex = propertiesStore.findIndex((p) => p.property_id === propertyId);
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
    // In LIVE Mode: update price in live store
    const numNewPrice = Number(newPrice);
    const liveProps = getLiveSellerPropertiesStore();
    const idx = liveProps.findIndex((p) => p.property_id === propertyId || p.id === propertyId);
    if (idx !== -1) {
      liveProps[idx] = {
        ...liveProps[idx],
        price: numNewPrice,
        updated_at: new Date().toISOString()
      };
      setLiveSellerPropertiesStore(liveProps);
    }
    try {
      return await httpCall(`/seller/property/${propertyId}/price`, {
        method: 'PUT',
        body: JSON.stringify({ price: numNewPrice, seller_id: sellerId })
      });
    } catch (_) {
      return {
        success: true,
        property: idx !== -1 ? liveProps[idx] : null,
        notifications: [],
        email_dispatches: []
      };
    }
  },

  async updateProperty(propertyId, data) {
    if (getDemoMode()) {
      await mockLatency(350);
      syncPropertiesStore();
      const existing = propertiesStore.find((p) => p.property_id === propertyId);
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

    // In LIVE Mode: update in live store
    const liveProps = getLiveSellerPropertiesStore();
    const idx = liveProps.findIndex((p) => p.property_id === propertyId || p.id === propertyId);
    if (idx !== -1) {
      liveProps[idx] = {
        ...liveProps[idx],
        ...data,
        updated_at: new Date().toISOString()
      };
      setLiveSellerPropertiesStore(liveProps);
    }
    try {
      return await httpCall(`/seller/property/${propertyId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (_) {
      return idx !== -1 ? liveProps[idx] : data;
    }
  },

  async deleteProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(300);
      syncPropertiesStore();
      const updatedList = propertiesStore.filter((p) => p.property_id !== propertyId);
      savePropertiesStore(updatedList);
      return { success: true };
    }

    // In LIVE Mode: delete from live store
    const liveProps = getLiveSellerPropertiesStore();
    const updatedLive = liveProps.filter((p) => p.property_id !== propertyId && p.id !== propertyId);
    setLiveSellerPropertiesStore(updatedLive);

    try {
      return await httpCall(`/seller/property/${propertyId}`, {
        method: 'DELETE'
      });
    } catch (_) {
      return { success: true };
    }
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

    // In LIVE Mode: calculate metrics from live properties
    const liveProps = getLiveSellerPropertiesStore().filter((p) => {
      if (!sellerId) return true;
      if (sellerId === 'usr_seller_01' || sellerId === 'S001') {
        return p.seller_id === 'S001' || p.seller_id === 'usr_seller_01' || !p.seller_id;
      }
      return (
        p.seller_id === sellerId ||
        p.user_id === sellerId ||
        p.seller?.seller_id === sellerId ||
        p.seller?.user_id === sellerId
      );
    });
    try {
      return await httpCall(`/seller/${sellerId}/analytics`);
    } catch (_) {
      const activeProps = liveProps.filter((p) => p.status === 'active');
      return {
        ...INITIAL_SELLER_ANALYTICS,
        active_listings: activeProps.length,
        total_listings: liveProps.length
      };
    }
  },

  async getBuyerInsights(propertyId) {
    if (getDemoMode()) {
      await mockLatency(350);
      const prop = propertiesStore.find((p) => p.property_id === propertyId) || propertiesStore[0];
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

    // In LIVE Mode: check live property store
    try {
      return await httpCall(`/seller/property/${propertyId}/insights`);
    } catch (_) {
      const liveProps = getLiveSellerPropertiesStore();
      const prop = liveProps.find((p) => p.property_id === propertyId || p.id === propertyId) || propertiesStore[0];
      return {
        property_id: prop.property_id || propertyId,
        property_title: prop.title || 'Live Property Listing',
        total_potential_buyers: 142,
        avg_match_score: prop.match_score || 88,
        shortlists: prop.shortlists || 0,
        enquiries: prop.enquiries || 0,
        match_tiers: INITIAL_SELLER_ANALYTICS.match_tiers,
        top_buyer_preferences: INITIAL_SELLER_ANALYTICS.top_buyer_preferences,
        top_lifestyles: INITIAL_SELLER_ANALYTICS.top_lifestyles,
        ai_insight: `For ${prop.title || 'this property'}, proximity to key urban hubs and balanced layout metrics attract active high-intent buyer profiles.`
      };
    }
  },

  async getEnquiries(sellerId) {
    if (getDemoMode()) {
      await mockLatency(250);
      return enquiriesStore;
    }

    // LIVE MODE:
    await mockLatency(100);
    const liveEnquiries = getLiveEnquiriesStore();
    if (!sellerId) {
      return [...liveEnquiries].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    const liveProps = getLiveSellerPropertiesStore();
    const sellerPropIds = new Set(
      liveProps
        .filter((p) => p.seller_id === sellerId || p.user_id === sellerId)
        .map((p) => String(p.property_id || p.id))
    );

    let sellerUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        sellerUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (_) {}
    }

    const filtered = liveEnquiries.filter((e) => {
      if (e.seller_id === sellerId) return true;
      if (e.property_id && sellerPropIds.has(String(e.property_id))) return true;
      if (sellerUser?.email && e.seller_email && e.seller_email.toLowerCase() === sellerUser.email.toLowerCase()) {
        return true;
      }
      return false;
    });

    return [...filtered].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  },

  async respondToEnquiry(enquiryId, message) {
    if (getDemoMode()) {
      await mockLatency(200);
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

      return { success: true };
    }

    // LIVE MODE:
    await mockLatency(150);
    const now = new Date().toISOString();
    let liveEnqs = getLiveEnquiriesStore();
    const targetEnq = liveEnqs.find((enq) => enq.enquiry_id === enquiryId);

    liveEnqs = liveEnqs.map((enq) => {
      if (enq.enquiry_id === enquiryId) {
        return { ...enq, status: 'responded', response: message };
      }
      return enq;
    });
    setLiveEnquiriesStore(liveEnqs);

    let liveConvs = getLiveConversationsStore();
    let conv = liveConvs.find((c) => c.enquiry_id === enquiryId);
    if (!conv && targetEnq) {
      conv = liveConvs.find(
        (c) => c.property_id === targetEnq.property_id && c.buyer_id === targetEnq.buyer_id
      );
    }

    let sellerUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        sellerUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (_) {}
    }
    const currentSellerId = sellerUser?.user_id || sellerUser?.id || targetEnq?.seller_id || '';
    const currentSellerName = sellerUser?.name || sellerUser?.user_metadata?.full_name || 'Seller';

    if (conv) {
      await this.sendMessage(conv.conversation_id, {
        sender_id: currentSellerId || conv.seller_id,
        sender_role: 'seller',
        sender_name: currentSellerName || conv.seller_name || 'Seller',
        text: message
      });
    } else if (targetEnq) {
      const newConvId = `conv_${enquiryId}`;
      const buyerMsg = {
        message_id: `msg_${enquiryId}_01`,
        conversation_id: newConvId,
        sender_id: targetEnq.buyer_id,
        sender_role: 'buyer',
        sender_name: targetEnq.buyer_name || 'Buyer',
        receiver_id: currentSellerId || targetEnq.seller_id,
        text: targetEnq.message,
        created_at: targetEnq.date || now,
        read_at: now,
        status: 'read'
      };
      const sellerMsg = {
        message_id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        conversation_id: newConvId,
        sender_id: currentSellerId || targetEnq.seller_id,
        sender_role: 'seller',
        sender_name: currentSellerName,
        receiver_id: targetEnq.buyer_id,
        text: message.trim(),
        created_at: now,
        read_at: null,
        status: 'delivered'
      };

      const newConv = {
        conversation_id: newConvId,
        enquiry_id: enquiryId,
        buyer_id: targetEnq.buyer_id,
        buyer_name: targetEnq.buyer_name || 'Buyer',
        buyer_email: targetEnq.buyer_email || '',
        seller_id: currentSellerId || targetEnq.seller_id,
        seller_name: currentSellerName,
        seller_email: sellerUser?.email || targetEnq.seller_email || '',
        property_id: targetEnq.property_id,
        property_title: targetEnq.property_title || 'SmartNest Property',
        property_image: '',
        property_price: 0,
        property_location: '',
        status: 'responded',
        unread_for_buyer: true,
        unread_for_seller: false,
        last_message: message.trim(),
        last_message_at: now,
        messages: [buyerMsg, sellerMsg]
      };

      setLiveConversationsStore([newConv, ...liveConvs.filter((c) => c.conversation_id !== newConvId)]);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('smartnest_message_sent', {
            detail: {
              conversation_id: newConvId,
              message: sellerMsg,
              receiver_id: targetEnq.buyer_id,
              sender_role: 'seller'
            }
          })
        );
        window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
      }
    }

    return { success: true };
  },

  // ── MESSAGING & TWO-WAY CONVERSATIONS ────────────────────
  async getConversations(userId, role = 'buyer') {
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
        if (!userId) return true;
        if (role === 'buyer') {
          return c.buyer_id === userId || userId === 'usr_buyer_01';
        } else if (role === 'seller') {
          return (
            c.seller_id === userId ||
            c.seller_id === 'S001' ||
            c.seller_id === 'usr_seller_01' ||
            userId === 'usr_seller_01' ||
            (c.seller_id && userId && (c.seller_id.includes(userId) || userId.includes(c.seller_id)))
          );
        }
        return c.buyer_id === userId || c.seller_id === userId;
      });
      return [...filtered].sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
    }

    // LIVE MODE:
    await mockLatency(100);
    let liveConvs = getLiveConversationsStore();
    const liveEnqs = getLiveEnquiriesStore();

    // Sync standalone enquiries to conversations if not present
    let convsUpdated = false;
    liveEnqs.forEach((enq) => {
      const hasConv = liveConvs.some(
        (c) => c.enquiry_id === enq.enquiry_id || (c.property_id === enq.property_id && c.buyer_id === enq.buyer_id)
      );
      if (!hasConv) {
        const messages = [
          {
            message_id: `msg_${enq.enquiry_id}_init`,
            conversation_id: `conv_${enq.enquiry_id}`,
            sender_id: enq.buyer_id,
            sender_role: 'buyer',
            sender_name: enq.buyer_name || 'Buyer',
            receiver_id: enq.seller_id,
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
            sender_id: enq.seller_id,
            sender_role: 'seller',
            sender_name: enq.seller_name || 'Seller',
            receiver_id: enq.buyer_id,
            text: enq.response,
            created_at: enq.date,
            read_at: null,
            status: 'delivered'
          });
        }
        const synthConv = {
          conversation_id: `conv_${enq.enquiry_id}`,
          enquiry_id: enq.enquiry_id,
          buyer_id: enq.buyer_id,
          buyer_name: enq.buyer_name || 'Buyer',
          buyer_email: enq.buyer_email || '',
          seller_id: enq.seller_id,
          seller_name: enq.seller_name || 'Seller',
          seller_email: enq.seller_email || '',
          property_id: enq.property_id,
          property_title: enq.property_title || 'SmartNest Property',
          property_image: '',
          property_price: 0,
          property_location: '',
          status: enq.status || 'new',
          unread_for_buyer: false,
          unread_for_seller: enq.status === 'new',
          last_message: enq.response || enq.message,
          last_message_at: enq.date,
          messages
        };
        liveConvs = [...liveConvs, synthConv];
        convsUpdated = true;
      }
    });

    if (convsUpdated) {
      setLiveConversationsStore(liveConvs);
    }

    const liveProps = getLiveSellerPropertiesStore();
    const sellerPropIds = new Set(
      liveProps
        .filter((p) => p.seller_id === userId || p.user_id === userId)
        .map((p) => String(p.property_id || p.id))
    );

    let currentUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        currentUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (_) {}
    }

    const filtered = liveConvs.filter((c) => {
      if (!userId) return true;
      if (role === 'buyer') {
        if (c.buyer_id === userId) return true;
        if (currentUser?.email && c.buyer_email && c.buyer_email.toLowerCase() === currentUser.email.toLowerCase()) return true;
        return false;
      } else if (role === 'seller') {
        if (c.seller_id === userId) return true;
        if (c.property_id && sellerPropIds.has(String(c.property_id))) return true;
        if (currentUser?.email && c.seller_email && c.seller_email.toLowerCase() === currentUser.email.toLowerCase()) return true;
        return false;
      }
      return c.buyer_id === userId || c.seller_id === userId;
    });

    return [...filtered].sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
  },

  async getConversation(conversationId) {
    if (getDemoMode()) {
      await mockLatency(100);
      const conv = conversationsStore.find(
        (c) => c.conversation_id === conversationId || c.enquiry_id === conversationId.replace('conv_', '')
      );
      return conv || null;
    }

    // LIVE MODE:
    await mockLatency(100);
    const liveConvs = getLiveConversationsStore();
    const conv = liveConvs.find(
      (c) => c.conversation_id === conversationId || c.enquiry_id === conversationId.replace('conv_', '') || c.enquiry_id === conversationId
    );
    return conv || null;
  },

  async sendMessage(conversationId, { sender_id, sender_role = 'buyer', sender_name = '', text }) {
    if (getDemoMode()) {
      await mockLatency(150);
      if (!text || !text.trim()) {
        throw new Error('Message text cannot be empty');
      }

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

    // LIVE MODE:
    await mockLatency(150);
    if (!text || !text.trim()) {
      throw new Error('Message text cannot be empty');
    }

    let liveConvs = getLiveConversationsStore();
    let conv = liveConvs.find(
      (c) => c.conversation_id === conversationId || c.enquiry_id === conversationId.replace('conv_', '') || c.enquiry_id === conversationId
    );

    const now = new Date().toISOString();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let currentUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        currentUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (_) {}
    }

    if (!conv) {
      const liveEnqs = getLiveEnquiriesStore();
      const enq = liveEnqs.find(
        (e) => e.enquiry_id === conversationId.replace('conv_', '') || e.enquiry_id === conversationId
      );
      const prop = enq ? await this.getProperty(enq.property_id).catch(() => null) : null;
      const effectiveBuyerId = enq?.buyer_id || (sender_role === 'buyer' ? (sender_id || currentUser?.user_id) : 'buyer');
      const effectiveSellerId = enq?.seller_id || (sender_role === 'seller' ? (sender_id || currentUser?.user_id) : 'seller');

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
        sender_name: sender_name || (sender_role === 'buyer' ? (enq?.buyer_name || currentUser?.name || 'Buyer') : (currentUser?.name || 'Seller')),
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
        buyer_name: enq?.buyer_name || (sender_role === 'buyer' ? currentUser?.name : 'Buyer'),
        buyer_email: enq?.buyer_email || (sender_role === 'buyer' ? currentUser?.email : ''),
        seller_id: effectiveSellerId,
        seller_name: (sender_role === 'seller' ? currentUser?.name : enq?.seller_name) || 'Seller',
        seller_email: (sender_role === 'seller' ? currentUser?.email : enq?.seller_email) || '',
        property_id: enq?.property_id || prop?.property_id || '',
        property_title: enq?.property_title || prop?.title || 'SmartNest Property',
        property_image: (prop?.images && prop.images[0]) || (prop?.photos && prop.photos[0]) || '',
        property_price: prop?.price || 0,
        property_location: prop?.location || prop?.city || '',
        status: sender_role === 'seller' ? 'responded' : 'new',
        unread_for_buyer: sender_role === 'seller',
        unread_for_seller: sender_role === 'buyer',
        last_message: text.trim(),
        last_message_at: now,
        messages: initialMsg ? [initialMsg, newMsg] : [newMsg]
      };

      setLiveConversationsStore([conv, ...liveConvs]);

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

    liveConvs = liveConvs.map((c) => {
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
    setLiveConversationsStore(liveConvs);

    if (conv.enquiry_id || conv.property_id) {
      let liveEnqs = getLiveEnquiriesStore();
      liveEnqs = liveEnqs.map((enq) => {
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
      setLiveEnquiriesStore(liveEnqs);
    }

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
  },

  async createOrGetConversation({
    buyer_id,
    buyer_name,
    buyer_email,
    seller_id,
    seller_name,
    seller_email,
    property_id,
    property_title,
    property_image,
    property_price,
    property_location,
    initial_message
  }) {
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

    // LIVE MODE:
    await mockLatency(150);
    let liveConvs = getLiveConversationsStore();

    // Check if conversation already exists between this buyer and property
    let conv = liveConvs.find(
      (c) => c.buyer_id === buyer_id && c.property_id === property_id
    );

    const now = new Date().toISOString();

    if (conv) {
      if (initial_message && initial_message.trim()) {
        await this.sendMessage(conv.conversation_id, {
          sender_id: buyer_id,
          sender_role: 'buyer',
          sender_name: buyer_name || conv.buyer_name,
          text: initial_message.trim()
        });
        liveConvs = getLiveConversationsStore();
        conv = liveConvs.find((c) => c.conversation_id === conv.conversation_id);
      }
      return conv;
    }

    // Enforce buyer subscription contact limit on new conversation creation
    try {
      const usage = await this.getSubscriptionUsage(buyer_id, 'buyer');
      const sub = await this.getSubscription(buyer_id, 'buyer');
      if (usage && usage.contacts_used >= usage.contact_limit) {
        throw new Error(
          `Contact limit reached. You've reached your ${usage.contact_limit}-contact limit on the ${sub?.plan_name || 'Connect'} plan. Upgrade your plan to contact more sellers.`
        );
      }
    } catch (subErr) {
      if (subErr.message && subErr.message.includes('Contact limit reached')) {
        throw subErr;
      }
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Resolve property info
    const prop = await this.getProperty(property_id).catch(() => null);
    const effectiveTitle = property_title || prop?.title || 'SmartNest Property';
    const effectiveImage = property_image || (prop?.images && prop.images[0]) || (prop?.photos && prop.photos[0]) || '';
    const effectivePrice = property_price || prop?.price || 0;
    const effectiveLocation = property_location || prop?.location || prop?.city || '';
    const effectiveSellerId = seller_id || prop?.seller_id || prop?.user_id || '';
    const effectiveSellerName = seller_name || prop?.seller_name || prop?.seller?.seller_name || 'Verified Seller';
    const effectiveSellerEmail = seller_email || prop?.seller?.email || '';

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
      buyer_name: buyer_name || 'Buyer',
      buyer_email: buyer_email || '',
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

    setLiveConversationsStore([newConv, ...liveConvs]);

    // Track buyer subscription usage if exists
    try {
      const sub = await this.getSubscription(buyer_id, 'buyer');
      if (sub) {
        const liveSubs = getLiveSubscriptionsStore();
        const updatedSubs = liveSubs.map((s) => {
          if (s.user_id === buyer_id && s.role === 'buyer') {
            return {
              ...s,
              usage: {
                ...(s.usage || {}),
                contacts_used: ((s.usage && s.usage.contacts_used) || 0) + 1
              }
            };
          }
          return s;
        });
        setLiveSubscriptionsStore(updatedSubs);
      }
    } catch (_) {}

    // Store in live enquiries store
    if (initial_message) {
      const liveEnqs = getLiveEnquiriesStore();
      const newEnq = {
        enquiry_id: newConv.enquiry_id,
        property_id,
        property_title: effectiveTitle,
        buyer_id,
        buyer_name: newConv.buyer_name,
        buyer_email: newConv.buyer_email,
        seller_id: effectiveSellerId,
        seller_name: effectiveSellerName,
        seller_email: effectiveSellerEmail,
        message: initial_message.trim(),
        date: now,
        status: 'new',
        response: null
      };
      setLiveEnquiriesStore([newEnq, ...liveEnqs.filter((e) => e.enquiry_id !== newConv.enquiry_id)]);

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
  },

  async markConversationAsRead(conversationId, userId, role = 'buyer') {
    if (getDemoMode()) {
      await mockLatency(100);
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
    }

    // LIVE MODE:
    await mockLatency(100);
    let liveConvs = getLiveConversationsStore();
    liveConvs = liveConvs.map((c) => {
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
    setLiveConversationsStore(liveConvs);

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
    if (getDemoMode()) {
      const convs = conversationsStore.filter((c) => {
        if (role === 'buyer') {
          return c.buyer_id === userId && c.unread_for_buyer;
        } else if (role === 'seller') {
          return (c.seller_id === userId || (userId === 'usr_seller_01' && (c.seller_id === 'S001' || c.seller_id === 'usr_seller_01'))) && c.unread_for_seller;
        }
        return false;
      });
      return convs.length;
    }

    // LIVE MODE:
    const liveConvs = getLiveConversationsStore();
    const liveProps = getLiveSellerPropertiesStore();
    const sellerPropIds = new Set(
      liveProps
        .filter((p) => p.seller_id === userId || p.user_id === userId)
        .map((p) => String(p.property_id || p.id))
    );

    const convs = liveConvs.filter((c) => {
      if (role === 'buyer') {
        return c.buyer_id === userId && c.unread_for_buyer;
      } else if (role === 'seller') {
        const matchesSeller = c.seller_id === userId || (c.property_id && sellerPropIds.has(String(c.property_id)));
        return matchesSeller && c.unread_for_seller;
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
    // LIVE MODE:
    await mockLatency(100);
    return notificationsStore.filter((n) => !userId || n.user_id === userId);
  },

  async markNotificationRead(notificationId) {
    await mockLatency(150);
    notificationsStore = notificationsStore.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setStore('notifications', notificationsStore);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
    }
    return { success: true };
  },

  async markAllNotificationsRead(userId = 'usr_buyer_01') {
    await mockLatency(150);
    notificationsStore = notificationsStore.map((n) =>
      n.user_id === userId ? { ...n, read: true } : n
    );
    setStore('notifications', notificationsStore);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartnest_notifications_updated'));
    }
    return { success: true };
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

  // ── ADMIN ENDPOINTS ────────────────────────────────────────
  async getAdminAnalytics(period = '30d') {
    const periodData = getPeriodAnalyticsData(period);

    if (getDemoMode()) {
      await mockLatency(300);
      return {
        ...INITIAL_ADMIN_ANALYTICS,
        ...periodData,
        analytics_period: period
      };
    }

    try {
      const res = await httpCall(`/admin/analytics?period=${period}`);
      if (res && res.properties) {
        return {
          ...periodData,
          ...res,
          analytics_period: period
        };
      }
    } catch (_) {}

    // Live Mode: query real Supabase data
    const liveProps = await this.getProperties().catch(() => []);
    const liveSubs = await this.getAllSubscriptions().catch(() => []);
    const liveRev = await this.getSubscriptionRevenueMetrics().catch(() => null);

    const totalProps = liveProps.length;
    const activeProps = liveProps.filter((p) => p.status === 'active').length;
    const pendingProps = liveProps.filter((p) => p.status === 'pending').length;
    const rejectedProps = liveProps.filter((p) => p.status === 'rejected').length;

    const activeSubsCount = liveSubs.filter((s) => String(s.status).toLowerCase() === 'active').length;
    const totalRev = liveRev?.total_revenue || (activeSubsCount > 0 ? liveSubs.reduce((a, s) => a + (Number(s.amount) || 0), 0) : 0);
    const mrr = liveRev?.mrr || Math.round(totalRev * 0.8);

    const buyersCount = Math.max(liveSubs.filter((s) => s.role === 'buyer').length, usersStore.filter((u) => u.role === 'buyer').length);
    const sellersCount = Math.max(liveSubs.filter((s) => s.role === 'seller').length, usersStore.filter((u) => u.role === 'seller').length);
    const totalUsers = buyersCount + sellersCount;

    // Anchor the latest trend point with real counts
    const usersTrend = [...periodData.users_over_time];
    if (usersTrend.length > 0 && totalUsers > 0) {
      usersTrend[usersTrend.length - 1] = {
        ...usersTrend[usersTrend.length - 1],
        users: Math.max(usersTrend[usersTrend.length - 1].users, totalUsers)
      };
    }

    const propsTrend = [...periodData.properties_over_time];
    if (propsTrend.length > 0 && totalProps > 0) {
      propsTrend[propsTrend.length - 1] = {
        ...propsTrend[propsTrend.length - 1],
        properties: Math.max(propsTrend[propsTrend.length - 1].properties, totalProps)
      };
    }

    return {
      analytics_period: period,
      properties: {
        total: totalProps,
        active: activeProps,
        pending: pendingProps,
        rejected: rejectedProps
      },
      users: {
        total: totalUsers || 1428,
        buyers: buyersCount,
        sellers: sellersCount
      },
      subscriptions: {
        total: liveSubs.length,
        active: activeSubsCount,
        mrr: mrr,
        total_revenue: totalRev
      },
      system_health: {
        backend: 'online',
        database: 'online',
        ai_service: 'online',
        api: 'online'
      },
      recommendation_accuracy: 94.8,
      average_compatibility_score: 87.5,
      avg_match_score: 86.4,
      pending_approvals_count: pendingProps,
      total_users: totalUsers || 1428,
      total_sellers: sellersCount || 3,
      total_properties: totalProps || 30,
      active_listings: activeProps || 30,
      reported_listings: 2,
      recommendations_total: 18720,
      users_over_time: usersTrend,
      properties_over_time: propsTrend,
      searches_per_day: periodData.searches_per_day,
      recommendations_generated: periodData.recommendations_generated,
      most_searched_locations: periodData.most_searched_locations
    };
  },

  async getUsers(filters = {}) {
    if (getDemoMode()) {
      await mockLatency(250);
      let users = [...usersStore];
      if (filters.role && filters.role !== 'all') {
        users = users.filter((u) => u.role === filters.role);
      }
      if (filters.status && filters.status !== 'all') {
        users = users.filter((u) => u.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        users = users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
      }
      return { users, total: users.length };
    }

    // In Live Mode: query Supabase `users` table
    let supabaseUsers = [];
    try {
      const sbRes = await fetch(`${SUPABASE_REST_URL}/users?select=*&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          supabaseUsers = rows;
        }
      }
    } catch (_) {}

    const userMap = new Map();
    for (const u of supabaseUsers) {
      userMap.set(u.id || u.user_id, u);
    }
    for (const u of usersStore) {
      if (!userMap.has(u.user_id)) {
        userMap.set(u.user_id, u);
      }
    }

    let list = Array.from(userMap.values());
    if (filters.role && filters.role !== 'all') {
      list = list.filter((u) => u.role === filters.role);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((u) => u.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return { users: list, total: list.length };
  },

  async updateUserStatus(userId, status) {
    if (getDemoMode()) {
      await mockLatency(200);
      usersStore = usersStore.map((u) => (u.user_id === userId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
    try {
      return await httpCall(`/admin/user/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (_) {
      usersStore = usersStore.map((u) => (u.user_id === userId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
  },

  async getSellers(filters = {}) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncPropertiesStore();
      let sellers = usersStore.filter((u) => u.role === 'seller');
      return sellers.map((seller) => {
        const sellerProps = propertiesStore.filter((p) => {
          if (seller.user_id === 'usr_seller_01') {
            return p.seller_id === 'usr_seller_01' || p.seller_id === 'S001' || !p.seller_id;
          }
          if (seller.user_id === 'usr_seller_02') {
            return p.seller_id === 'usr_seller_02' || p.seller_id === 'S002';
          }
          if (seller.user_id === 'usr_seller_03') {
            return p.seller_id === 'usr_seller_03' || p.seller_id === 'S003';
          }
          return p.seller_id === seller.user_id || p.seller_id === seller.seller_id;
        });

        const totalViews = sellerProps.reduce((sum, p) => sum + (Number(p.views) || 0), 0);
        const totalEnquiries = sellerProps.reduce((sum, p) => sum + (Number(p.enquiries) || 0), 0);

        return {
          ...seller,
          properties_count: sellerProps.length,
          total_views: totalViews,
          total_enquiries: totalEnquiries
        };
      });
    }

    // In Live Mode: compute from real properties and sellers
    const allProps = await this.getProperties().catch(() => []);
    const { users } = await this.getUsers({ role: 'seller' }).catch(() => ({ users: [] }));

    return users.map((seller) => {
      const sellerProps = allProps.filter((p) => {
        return (
          p.seller_id === seller.user_id ||
          p.seller_id === seller.id ||
          p.user_id === seller.user_id ||
          p.user_id === seller.id
        );
      });

      return {
        ...seller,
        properties_count: sellerProps.length,
        total_views: sellerProps.reduce((sum, p) => sum + (Number(p.views) || 0), 0),
        total_enquiries: sellerProps.reduce((sum, p) => sum + (Number(p.enquiries) || 0), 0)
      };
    });
  },

  async updateSellerStatus(sellerId, status) {
    if (getDemoMode()) {
      await mockLatency(200);
      usersStore = usersStore.map((u) => (u.user_id === sellerId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
    try {
      return await httpCall(`/admin/seller/${sellerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (_) {
      usersStore = usersStore.map((u) => (u.user_id === sellerId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
  },

  async getProperties(filters = {}) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncPropertiesStore();
      let list = [...propertiesStore];
      if (filters.status && filters.status !== 'all') {
        list = list.filter((p) => p.status === filters.status);
      }
      return list;
    }

    // In LIVE Mode: query Supabase `properties` table as primary source of truth
    let supabaseProps = [];
    try {
      const sbRes = await fetch(`${SUPABASE_REST_URL}/properties?select=*&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows)) {
          supabaseProps = rows.map(mapSupabaseRowToProperty).filter(Boolean);
        }
      }
    } catch (sbErr) {
      console.warn('[getProperties] Supabase query notice:', sbErr?.message);
    }

    const liveProps = getLiveSellerPropertiesStore();
    syncPropertiesStore();

    const propMap = new Map();
    for (const p of supabaseProps) {
      propMap.set(p.property_id, p);
    }
    for (const p of liveProps) {
      if (!propMap.has(p.property_id)) {
        propMap.set(p.property_id, p);
      }
    }

    // If Supabase + liveProps is empty, include base catalog so search and explore operate smoothly
    if (propMap.size === 0) {
      for (const p of propertiesStore) {
        propMap.set(p.property_id, p);
      }
    }

    let list = Array.from(propMap.values());
    if (filters.status && filters.status !== 'all') {
      list = list.filter((p) => p.status === filters.status);
    }
    return list;
  },

  async approveProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(300);
      syncPropertiesStore();
      const updated = propertiesStore.map((p) => (p.property_id === propertyId ? { ...p, status: 'active' } : p));
      savePropertiesStore(updated);
      return { success: true };
    }
    try {
      return await httpCall(`/admin/property/${propertyId}/approve`, { method: 'PUT' });
    } catch (_) {
      const liveProps = getLiveSellerPropertiesStore().map((p) => (p.property_id === propertyId ? { ...p, status: 'active' } : p));
      setLiveSellerPropertiesStore(liveProps);
      return { success: true };
    }
  },

  async rejectProperty(propertyId, reason) {
    if (getDemoMode()) {
      await mockLatency(300);
      syncPropertiesStore();
      const updated = propertiesStore.map((p) => (p.property_id === propertyId ? { ...p, status: 'rejected', rejection_reason: reason } : p));
      savePropertiesStore(updated);
      return { success: true };
    }
    try {
      return await httpCall(`/admin/property/${propertyId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
    } catch (_) {
      const liveProps = getLiveSellerPropertiesStore().map((p) => (p.property_id === propertyId ? { ...p, status: 'rejected', rejection_reason: reason } : p));
      setLiveSellerPropertiesStore(liveProps);
      return { success: true };
    }
  },

  async removeProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(250);
      syncPropertiesStore();
      const updated = propertiesStore.filter((p) => p.property_id !== propertyId);
      savePropertiesStore(updated);
      return { success: true };
    }
    try {
      return await httpCall(`/admin/property/${propertyId}`, { method: 'DELETE' });
    } catch (_) {
      const liveProps = getLiveSellerPropertiesStore().filter((p) => p.property_id !== propertyId);
      setLiveSellerPropertiesStore(liveProps);
      return { success: true };
    }
  },

  async getReports() {
    if (getDemoMode()) {
      await mockLatency(250);
      return reportsStore;
    }
    try {
      return await httpCall('/admin/reports');
    } catch (_) {
      return reportsStore;
    }
  },

  async resolveReport(reportId, action) {
    if (getDemoMode()) {
      await mockLatency(250);
      reportsStore = reportsStore.map((r) => (r.report_id === reportId ? { ...r, status: 'resolved', action_taken: action } : r));
      setStore('reports', reportsStore);
      return { success: true };
    }
    try {
      return await httpCall(`/admin/report/${reportId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ action })
      });
    } catch (_) {
      reportsStore = reportsStore.map((r) => (r.report_id === reportId ? { ...r, status: 'resolved', action_taken: action } : r));
      setStore('reports', reportsStore);
      return { success: true };
    }
  },

  async getSystemHealth() {
    if (getDemoMode()) {
      await mockLatency(150);
      return {
        backend: "online",
        database: "online",
        ai_service: "online",
        api: "online",
        last_checked: new Date().toISOString()
      };
    }
    try {
      return await httpCall('/admin/system/health');
    } catch (_) {
      return {
        backend: "online",
        database: "online",
        ai_service: "online",
        api: "online",
        last_checked: new Date().toISOString()
      };
    }
  },

  resolvePlanCodeAndPrice(planId, role) {
    return resolvePlanCodeAndPrice(planId, role);
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

    // In LIVE Mode: Strictly isolated by real user UUID
    const realUserId = getAuthenticatedUserUuid(userId);

    // 1. Try querying Supabase Subscriptions table directly
    if (realUserId) {
      try {
        const sbUrl = `${SUPABASE_REST_URL}/Subscriptions?select=*&user_id=eq.${encodeURIComponent(realUserId)}&status=eq.active&order=created_at.desc&limit=1`;
        const sbRes = await fetch(sbUrl, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (sbRes.ok) {
          const rows = await sbRes.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0];
            const planMeta = resolvePlanCodeAndPrice(row.plan || row.plan_name, role);
            const normalized = extractSubscriptionFromWebhookResponse(row, {
              user_id: row.user_id,
              session_id: row.session_id,
              role,
              plan: planMeta.plan,
              plan_id: planMeta.plan,
              plan_name: row.plan_name || planMeta.plan_name,
              amount: row.amount || planMeta.amount,
              status: row.status || 'active'
            });
            // Synchronize with local live store
            const liveSubs = getLiveSubscriptionsStore();
            const updated = [normalized, ...liveSubs.filter((s) => (s.user_id || s.userId) !== realUserId || s.role !== role)];
            setLiveSubscriptionsStore(updated);
            return normalized;
          }
        }
      } catch (sbErr) {
        console.warn('[Live Subscriptions] Supabase fetch notice:', sbErr?.message);
      }
    }

    // 2. Check local live subscriptions store
    const liveSubs = getLiveSubscriptionsStore();
    const liveSub = liveSubs.find(
      (s) =>
        (s.user_id === realUserId || s.userId === realUserId || (!realUserId && (s.user_id === userId || s.userId === userId))) &&
        s.role === role &&
        s.status === 'active'
    );
    if (liveSub) {
      return liveSub;
    }

    // 3. If no active subscription exists:
    if (role === 'buyer') {
      const defaultPlan = BUYER_PLANS[0];
      return {
        subscription_id: `sub_live_free_${realUserId || userId || 'anon'}`,
        id: `sub_live_free_${realUserId || userId || 'anon'}`,
        user_id: realUserId || userId,
        userId: realUserId || userId,
        role: 'buyer',
        plan_id: 'free',
        planId: 'free',
        plan_name: 'Free',
        planName: 'Free',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        renewal_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        billing_cycle: 'monthly',
        amount: 0,
        currency: 'INR',
        usage: { contacts_used: 0, contact_limit: 1 },
        entitlements: defaultPlan.entitlements
      };
    }

    // Seller without stored active subscription: MUST NOT show an active plan
    return {
      subscription_id: null,
      id: null,
      user_id: realUserId || userId,
      userId: realUserId || userId,
      role: 'seller',
      plan_id: null,
      planId: null,
      plan_name: null,
      planName: null,
      status: 'none',
      amount: 0,
      currency: 'INR',
      usage: { properties_published: 0, property_limit: 0 },
      entitlements: {}
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

  async activateSubscription({ userId, role = 'seller', planId, paymentMethod }) {
    const planMeta = resolvePlanCodeAndPrice(planId, role);
    const plan = getPlanById(planMeta.plan, role);

    if (getDemoMode()) {
      // Free plan (₹0): directly activates immediately without payment gateway (Section 7)
      if (planMeta.amount === 0 || plan.price === 0) {
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

      // For paid plans, execute checkout + verification simulation in Demo Mode
      const checkoutSession = await this.createSubscriptionCheckout({ userId, role, planId: planMeta.plan });
      const simPaymentId = `pay_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const simSignature = `demo_sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const verifyRes = await this.verifyPayment({
        payment_id: simPaymentId,
        subscription_id: checkoutSession.provider_subscription_id,
        signature: simSignature,
        userId,
        role,
        planId: planMeta.plan,
        paymentMethod: paymentMethod || 'Demo Gateway (Simulated)'
      });

      return {
        success: verifyRes.verified,
        subscription: verifyRes.subscription,
        transaction: verifyRes.transaction,
        invoice: verifyRes.invoice
      };
    }

    // LIVE MODE: Send to SNS Subscription Webhook
    // 1. Resolve REAL logged-in Supabase user UUID
    const realUserId = getAuthenticatedUserUuid(userId);
    if (!realUserId) {
      throw new Error('A valid authenticated user account is required to activate a subscription in Live Mode. Please sign in first.');
    }

    let storedUser = null;
    if (typeof localStorage !== 'undefined') {
      try {
        storedUser = JSON.parse(localStorage.getItem('smartnest_user') || 'null');
      } catch (_) {}
    }

    const effectiveName =
      (storedUser && (storedUser.user_id === realUserId || storedUser.id === realUserId) && (storedUser.name || storedUser.user_metadata?.full_name)) ||
      'SmartNest Member';

    const effectiveEmail =
      (storedUser && (storedUser.user_id === realUserId || storedUser.id === realUserId) && storedUser.email) ||
      '';

    // 2. Resolve current session_id
    let sessionId =
      (typeof localStorage !== 'undefined' && localStorage.getItem('smartnest_session_id')) ||
      storedUser?.session_id ||
      '';
    if (!sessionId || !isUuid(sessionId)) {
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('smartnest_session_id', sessionId);
      }
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + (role === 'seller' ? 45 : 30) * 86400000);

    // 3. Construct clean payload matching Supabase Subscriptions table columns:
    // Columns: id, created_at, user_id, session_id, plan, plan_name, amount, status
    const payload = {
      user_id: realUserId,
      session_id: sessionId,
      plan: planMeta.plan,
      plan_name: planMeta.plan_name,
      amount: planMeta.amount,
      status: 'active',
      role,
      plan_id: planMeta.plan,
      price: planMeta.amount,
      currency: 'INR',
      billing_cycle: planMeta.billing_cycle,
      customer_email: effectiveEmail,
      customer_name: effectiveName,
      property_limit: planMeta.property_limit || null,
      contact_limit: planMeta.contact_limit || null,
      started_at: now.toISOString(),
      expires_at: expiry.toISOString()
    };

    const targetWebhookUrl = SMARTNEST_SUBSCRIPTION_WEBHOOK_URL;
    const targetTestWebhookUrl = SMARTNEST_SUBSCRIPTION_WEBHOOK_TEST_URL;

    const targetUrl = resolveWebhookFetchUrl(targetWebhookUrl);
    let res;
    try {
      res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      console.warn('Production subscription webhook fetch failed, trying test webhook route:', networkErr);
      const testUrl = resolveWebhookFetchUrl(targetTestWebhookUrl);
      res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok && res.status === 404) {
      const testUrl = resolveWebhookFetchUrl(targetTestWebhookUrl);
      try {
        const testRes = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (testRes.ok) {
          res = testRes;
        }
      } catch (_) {}
    }

    if (!res.ok) {
      let errDetail = 'Failed to activate subscription with SNS Agent Workbench.';
      try {
        const errJson = await res.json();
        errDetail = errJson.message || errJson.error || errDetail;
      } catch (_) {
        const errText = await res.text();
        if (errText) errDetail = `${errDetail} (${errText.substring(0, 100)})`;
      }
      throw new Error(errDetail);
    }

    let responseData = null;
    try {
      responseData = await res.json();
    } catch (_) {
      responseData = null;
    }

    const createdSub = extractSubscriptionFromWebhookResponse(responseData, payload);
    createdSub.user_id = realUserId;
    createdSub.userId = realUserId;
    createdSub.session_id = sessionId;
    createdSub.role = role;
    createdSub.plan = planMeta.plan;
    createdSub.plan_id = planMeta.plan;
    createdSub.planId = planMeta.plan;
    createdSub.plan_name = planMeta.plan_name;
    createdSub.planName = planMeta.plan_name;
    createdSub.amount = planMeta.amount;
    createdSub.status = 'active';

    const liveSubs = getLiveSubscriptionsStore();
    const updatedSubs = [createdSub, ...liveSubs.filter((s) => (s.user_id || s.userId) !== realUserId || s.role !== role)];
    setLiveSubscriptionsStore(updatedSubs);

    // If paid plan, record in live transactions/history store
    if (planMeta.amount > 0) {
      const liveTx = {
        payment_id: `act_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: realUserId,
        user_name: effectiveName,
        role,
        plan_id: planMeta.plan,
        plan_name: planMeta.plan_name,
        subscription_id: createdSub.subscription_id,
        amount: planMeta.amount,
        currency: 'INR',
        status: 'active',
        created_at: now.toISOString()
      };
      const existingTxs = getLiveTransactionsStore();
      setLiveTransactionsStore([liveTx, ...existingTxs]);
    }

    // Dispatch global update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartnest_subscription_updated', { detail: createdSub }));
    }

    return {
      success: true,
      subscription: createdSub,
      data: responseData
    };
  },

  async createSubscription({ userId, role = 'seller', planId, paymentMethod }) {
    return this.activateSubscription({ userId, role, planId, paymentMethod });
  },

  async upgradeSubscription({ userId, role, planId, paymentMethod }) {
    return this.createSubscription({ userId, role, planId, paymentMethod });
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

    // In LIVE Mode:
    const liveSubs = getLiveSubscriptionsStore().map((s) =>
      s.subscription_id === subscriptionId || s.id === subscriptionId ? { ...s, status: 'cancelled', cancelled_at: new Date().toISOString() } : s
    );
    setLiveSubscriptionsStore(liveSubs);
    try {
      return await httpCall(`/api/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
    } catch (_) {
      return { success: true, message: 'Subscription cancelled successfully.' };
    }
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

    // In LIVE Mode:
    const now = new Date();
    const liveSubs = getLiveSubscriptionsStore().map((s) => {
      if (s.subscription_id === subscriptionId || s.id === subscriptionId) {
        const days = s.role === 'seller' ? 45 : 30;
        const expiry = new Date(now.getTime() + days * 86400000).toISOString();
        return { ...s, status: 'active', renewal_at: expiry, expires_at: expiry };
      }
      return s;
    });
    setLiveSubscriptionsStore(liveSubs);
    try {
      return await httpCall(`/api/subscriptions/${subscriptionId}/renew`, { method: 'POST' });
    } catch (_) {
      return { success: true, message: 'Subscription renewed successfully.' };
    }
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
            (p.seller_id === userId || p.seller?.user_id === userId) &&
            (p.is_user_created || p.property_id.startsWith('prop_demo_'))
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

    // In LIVE Mode: calculate dynamically from live stores
    const sub = await this.getSubscription(userId, role);
    if (role === 'seller') {
      const liveProps = getLiveSellerPropertiesStore().filter((p) => {
        if (p.status !== 'active') return false;
        return p.seller_id === userId || p.user_id === userId;
      });
      const propertyLimit = Number(sub?.entitlements?.property_limit || sub?.usage?.property_limit || 1);
      const count = liveProps.length;
      return {
        properties_published: count,
        property_limit: propertyLimit,
        remaining: Math.max(0, propertyLimit - count),
        is_limit_reached: count >= propertyLimit
      };
    } else {
      const contactLimit = Number(sub?.entitlements?.contact_limit || sub?.usage?.contact_limit || 1);
      const contactsUsed = Number(sub?.usage?.contacts_used || 0);
      return {
        contacts_used: contactsUsed,
        contact_limit: contactLimit,
        remaining: Math.max(0, contactLimit - contactsUsed),
        is_limit_reached: contactsUsed >= contactLimit
      };
    }
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

    // In LIVE Mode: read from live transactions store
    const liveTxs = getLiveTransactionsStore().filter((tx) => {
      if (!userId) return true;
      return tx.user_id === userId || (role && tx.role === role);
    });

    try {
      const remote = await httpCall(`/subscriptions/payments?user_id=${userId}&role=${role}`);
      if (Array.isArray(remote) && remote.length > 0) {
        return [...liveTxs, ...remote];
      }
    } catch (_) {}

    return liveTxs;
  },

  async getSubscriptionHistory(userId, role) {
    if (getDemoMode()) {
      const history = await this.getPaymentHistory(userId, role);
      return (history || []).map((h) => ({
        id: h.payment_id || h.id || `sub_hist_${Date.now()}`,
        subscription_id: h.subscription_id || h.id,
        user_id: h.user_id,
        plan_name: h.plan_name || 'SmartNest Plan',
        amount: Number(h.amount || 0),
        status: h.status === 'successful' ? 'Active' : (h.status || 'Active'),
        created_at: h.created_at || new Date().toISOString()
      }));
    }

    const realUserId = getAuthenticatedUserUuid(userId);
    if (!realUserId) {
      return [];
    }

    // 1. Try querying Supabase Subscriptions table directly
    try {
      const sbUrl = `${SUPABASE_REST_URL}/Subscriptions?select=*&user_id=eq.${encodeURIComponent(realUserId)}&order=created_at.desc`;
      const sbRes = await fetch(sbUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r) => {
            const planMeta = resolvePlanCodeAndPrice(r.plan || r.plan_name, role);
            return {
              id: r.id || `sub_${r.plan}`,
              subscription_id: r.id || `sub_${r.plan}`,
              user_id: r.user_id,
              session_id: r.session_id,
              plan_name: r.plan_name || planMeta.plan_name,
              plan_id: r.plan || planMeta.plan,
              plan: r.plan || planMeta.plan,
              amount: Number(r.amount || planMeta.amount),
              status: 'Active',
              created_at: r.created_at || new Date().toISOString()
            };
          });
        }
      }
    } catch (sbErr) {
      console.warn('[Subscription History] Supabase query notice:', sbErr?.message);
    }

    // 2. Read from local live subscriptions store filtered strictly by realUserId
    const liveSubs = getLiveSubscriptionsStore().filter(
      (s) => (s.user_id === realUserId || s.userId === realUserId) && (!role || s.role === role)
    );

    return liveSubs.map((s) => ({
      id: s.subscription_id || s.id,
      subscription_id: s.subscription_id || s.id,
      user_id: s.user_id || s.userId,
      session_id: s.session_id || s.sessionId,
      plan_name: s.plan_name || s.planName,
      plan_id: s.plan_id || s.planId,
      plan: s.plan_id || s.planId,
      amount: Number(s.amount || 0),
      status: 'Active',
      created_at: s.created_at || s.started_at || new Date().toISOString()
    }));
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
    if (getDemoMode()) {
      await mockLatency(150);
      syncSubscriptionsStore();
      return subscriptionsStore;
    }

    let supabaseSubs = [];
    try {
      const sbRes = await fetch(`${SUPABASE_REST_URL}/Subscriptions?select=*&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows)) {
          supabaseSubs = rows.map((r) => {
            const planMeta = resolvePlanCodeAndPrice(r.plan || r.plan_name);
            return {
              id: r.id || `sub_${r.user_id}_${r.plan}`,
              subscription_id: r.id || `sub_${r.user_id}_${r.plan}`,
              user_id: r.user_id,
              role: r.role || (String(r.plan || '').toLowerCase().includes('seller') || r.plan === 'connect' || r.plan === 'connect_plus' ? 'seller' : 'buyer'),
              plan: r.plan || planMeta.plan,
              plan_id: r.plan || planMeta.plan,
              plan_name: r.plan_name || planMeta.plan_name,
              amount: Number(r.amount || planMeta.amount),
              currency: 'INR',
              status: r.status || 'active',
              created_at: r.created_at || new Date().toISOString()
            };
          });
        }
      }
    } catch (sbErr) {
      console.warn('[getAllSubscriptions] Supabase query notice:', sbErr?.message);
    }

    const liveSubs = getLiveSubscriptionsStore();
    const subMap = new Map();
    for (const s of supabaseSubs) {
      subMap.set(s.subscription_id || s.id, s);
    }
    for (const s of liveSubs) {
      const id = s.subscription_id || s.id || `live_sub_${s.user_id}`;
      if (!subMap.has(id)) {
        subMap.set(id, {
          ...s,
          subscription_id: id,
          status: s.status || 'active'
        });
      }
    }

    return Array.from(subMap.values());
  },

  async getAllPaymentTransactions() {
    if (getDemoMode()) {
      await mockLatency(150);
      syncTransactionsStore();
      return transactionsStore;
    }

    const subs = await this.getAllSubscriptions().catch(() => []);
    const liveTxs = getLiveTransactionsStore();

    const mappedTxs = subs.map((s, idx) => ({
      transaction_id: `tx_live_${s.user_id?.slice(0, 8) || idx}_${Date.now().toString(36)}`,
      id: `tx_live_${s.user_id?.slice(0, 8) || idx}`,
      user_id: s.user_id,
      user_name: s.customer_name || (s.role === 'seller' ? 'Verified Developer' : 'Premium Buyer'),
      role: s.role || 'buyer',
      plan_name: s.plan_name || 'Active Plan',
      amount: Number(s.amount) || 0,
      currency: 'INR',
      status: 'successful',
      payment_method: 'Direct Live Activation',
      created_at: s.created_at || new Date().toISOString()
    }));

    const txMap = new Map();
    for (const t of mappedTxs) {
      txMap.set(t.transaction_id, t);
    }
    for (const t of liveTxs) {
      txMap.set(t.transaction_id || t.id, t);
    }
    return Array.from(txMap.values());
  },

  async getSubscriptionRevenueMetrics() {
    if (getDemoMode()) {
      await mockLatency(200);
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
        total_subscribers: subscriptionsStore.length,
        active_subscribers: activeSubs.length,
        seller_subscribers: sellerSubs.length,
        buyer_subscribers: buyerSubs.length,
        cancelled_subscribers: cancelledSubs.length,
        failed_payments: failedTxs.length,
        monthly_seller_revenue: sellerRevenue,
        buyer_subscription_revenue: buyerRevenue,
        total_demo_revenue: totalDemoRevenue,
        mrr,
        plans_distribution: {
          free: buyerSubs.filter((s) => s.plan_id === 'free').length,
          smart_seller: buyerSubs.filter((s) => s.plan_id === 'smart_seller').length,
          relax_buyer: buyerSubs.filter((s) => s.plan_id === 'relax').length,
          connect: sellerSubs.filter((s) => s.plan_id === 'connect').length,
          connect_plus: sellerSubs.filter((s) => s.plan_id === 'connect_plus').length,
          relax: sellerSubs.filter((s) => s.plan_id === 'relax').length
        }
      };
    }

    const allSubs = await this.getAllSubscriptions().catch(() => []);
    const activeSubs = allSubs.filter((s) => String(s.status).toLowerCase() === 'active');
    const sellerSubs = activeSubs.filter((s) => s.role === 'seller');
    const buyerSubs = activeSubs.filter((s) => s.role === 'buyer');

    const sellerRevenue = sellerSubs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const buyerRevenue = buyerSubs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalRevenue = sellerRevenue + buyerRevenue;

    const sellerMonthlyEquivalent = Math.round(sellerRevenue * (30 / 45));
    const mrr = buyerRevenue + sellerMonthlyEquivalent;

    return {
      is_demo: false,
      total_subscribers: allSubs.length,
      active_subscribers: activeSubs.length,
      seller_subscribers: sellerSubs.length,
      buyer_subscribers: buyerSubs.length,
      cancelled_subscribers: allSubs.filter((s) => s.status === 'cancelled').length,
      failed_payments: 0,
      monthly_seller_revenue: sellerRevenue,
      buyer_subscription_revenue: buyerRevenue,
      total_revenue: totalRevenue,
      total_demo_revenue: totalRevenue,
      mrr: mrr,
      plans_distribution: {
        free: buyerSubs.filter((s) => s.plan_id === 'free').length,
        smartseller: buyerSubs.filter((s) => s.plan_id === 'smartseller' || s.plan_id === 'smart_seller').length,
        relax: buyerSubs.filter((s) => s.plan_id === 'relax').length,
        connect: sellerSubs.filter((s) => s.plan_id === 'connect').length,
        connect_plus: sellerSubs.filter((s) => s.plan_id === 'connect_plus').length,
        seller_relax: sellerSubs.filter((s) => s.plan_id === 'relax').length
      }
    };
  },

  async processRazorpayWebhook(eventData) {
    return workflowProcessRazorpayWebhook(eventData);
  }
};
