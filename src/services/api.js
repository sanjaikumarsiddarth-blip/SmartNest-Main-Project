// Centralized API Service for SmartNest AI
// CRITICAL RULE: Zero business logic in UI components. All requests flow through this file.

import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_LIFESTYLE_PROFILE,
  INITIAL_SELLER_ANALYTICS,
  INITIAL_ADMIN_ANALYTICS,
  INITIAL_ENQUIRIES,
  INITIAL_REPORTS,
  INITIAL_SEARCH_HISTORY
} from './mockData.js';

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

const SMARTNEST_API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SMARTNEST_API_URL) || 'https://api.smartnest.ai/v1';

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
  }
};

// Initialize persistent stores if not present
let propertiesStore = getStore('properties', INITIAL_PROPERTIES).map((p) => {
  if (!p.coordinates) {
    const init = INITIAL_PROPERTIES.find((ip) => ip.property_id === p.property_id);
    if (init && init.coordinates) {
      return { ...p, coordinates: init.coordinates };
    }
  }
  return p;
});
let usersStore = getStore('users', INITIAL_USERS);
let enquiriesStore = getStore('enquiries', INITIAL_ENQUIRIES);
let reportsStore = getStore('reports', INITIAL_REPORTS);
let searchHistoryStore = getStore('history', INITIAL_SEARCH_HISTORY);
let shortlistStore = getStore('shortlist', ["P01", "P02"]);
let lifestyleProfileStore = getStore('lifestyle_profile', INITIAL_LIFESTYLE_PROFILE);

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
  async login(email, password) {
    if (getDemoMode()) {
      await mockLatency(300);
      const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error("No account found with this email address");
      }
      if (user.password !== password) {
        throw new Error("Incorrect password entered");
      }
      if (user.status === "inactive") {
        throw new Error("Account is inactive. Please contact support.");
      }
      const token = `mock_jwt_token_${user.user_id}_${Date.now()}`;
      return {
        user_id: user.user_id,
        name: user.name,
        role: user.role,
        email: user.email,
        token
      };
    }
    return httpCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
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
  async analyzeLifestyle(preferences) {
    if (getDemoMode()) {
      await mockLatency(450);
      // Simulated backend lifestyle analysis
      const budgetLakhs = preferences.budget ? Math.round(preferences.budget / 100000) : 55;
      const profile = {
        lifestyle_type: preferences.family_size > 2 ? "Family-Oriented Professional" : "Tech-Driven Urbanite",
        ai_summary: `Calculated priority index favors ${preferences.commute_mode || 'convenient'} commuting (max ${preferences.max_commute || 30}m) in ${preferences.city || 'Coimbatore'}. Dealbreakers include keeping acquisition budget below ₹${budgetLakhs}L with acoustic noise suppression.`,
        priority_weights: {
          commute: preferences.priorities?.[0] === 'commute' ? 30 : 25,
          budget: preferences.priorities?.[0] === 'budget' ? 30 : 20,
          schools: preferences.school_importance === 'high' ? 25 : 15,
          noise: preferences.noise_pref === 'quiet' ? 20 : 10,
          parks: preferences.park_walking ? 15 : 10,
          amenities: (preferences.amenities?.length || 0) > 6 ? 15 : 10
        },
        dealbreakers: [
          `Commute above ${preferences.max_commute || 30} minutes`,
          preferences.dealbreakers?.noise_low ? "High noise" : null,
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
      let results = propertiesStore.filter((p) => p.status === 'active');

      // Backend simulated filtering and sorting (Zero calculation in frontend)
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

      return {
        properties: results,
        total_matched: results.length,
        profile: lifestyleProfileStore
      };
    }
    return httpCall('/buyer/recommend', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
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
      // Backend simulated semantic matching
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
      const savedProps = propertiesStore.filter((p) => shortlistStore.includes(p.property_id));
      return { properties: savedProps, count: savedProps.length };
    }
    return httpCall(`/buyer/shortlist/${sessionId}`);
  },

  // ── PROPERTIES ─────────────────────────────────────────────
  async getProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(300);
      const found = propertiesStore.find((p) => p.property_id === propertyId);
      if (!found) {
        throw new Error("Property not found");
      }
      return found;
    }
    return httpCall(`/property/${propertyId}`);
  },

  async compareProperties(ids = []) {
    if (getDemoMode()) {
      await mockLatency(300);
      const selected = propertiesStore.filter((p) => ids.includes(p.property_id));
      const comparisonSummary = selected.length >= 2
        ? `${selected[0].title} (${selected[0].property_id}) stands out for its commute and noise score (${selected[0].match_score}% match), while ${selected[1].title} (${selected[1].property_id}) offers a distinguished layout with ${selected[1].green_score} green score. For a family prioritizing daily transit and tranquility, ${selected[0].property_id} is the stronger choice.`
        : "Select at least 2 properties to generate an AI comparison summary.";

      return {
        properties: selected,
        ai_comparison_summary: comparisonSummary
      };
    }
    return httpCall('/property/compare', {
      method: 'POST',
      body: JSON.stringify({ ids })
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

  async sendEnquiry(propertyId, message, sessionId) {
    if (getDemoMode()) {
      await mockLatency(350);
      const prop = propertiesStore.find((p) => p.property_id === propertyId);
      const newEnq = {
        enquiry_id: `enq_${Date.now()}`,
        property_id: propertyId,
        property_title: prop ? prop.title : "SmartNest Property",
        buyer_id: "usr_buyer_01",
        buyer_name: "Aarav Sharma",
        buyer_email: "aarav@smartnest.ai",
        seller_id: prop ? prop.seller_id : "usr_seller_01",
        message,
        date: new Date().toISOString(),
        status: "new",
        response: null
      };
      enquiriesStore = [newEnq, ...enquiriesStore];
      setStore('enquiries', enquiriesStore);
      return { success: true, enquiry_id: newEnq.enquiry_id };
    }
    return httpCall(`/property/${propertyId}/enquiry`, {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId })
    });
  },

  // ── SELLER ENDPOINTS ───────────────────────────────────────
  async getSellerProperties(sellerId) {
    if (getDemoMode()) {
      await mockLatency(300);
      // If sellerId provided, filter by it, else return all active/pending/sold for demo
      const items = propertiesStore.filter((p) => !sellerId || p.seller_id === sellerId || sellerId === 'usr_seller_01');
      return items;
    }
    return httpCall(`/seller/${sellerId}/properties`);
  },

  async createProperty(data) {
    if (getDemoMode()) {
      await mockLatency(400);
      const newProp = {
        property_id: `P0${propertiesStore.length + 1}`,
        title: data.title || "Modern Residential Landmark",
        type: data.type || "Apartment",
        price: Number(data.price) || 6000000,
        bhk: Number(data.bhk) || 2,
        area_sqft: Number(data.area_sqft) || 1200,
        location: data.location || "Avinashi Road",
        city: data.city || "Coimbatore",
        description: data.description || "Beautiful high-spec living space.",
        images: data.images?.length > 0 ? data.images : [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
        ],
        commute_minutes: 20,
        commute_mode: "Car",
        school_distance_km: Number(data.school_distance_km) || 1.5,
        hospital_distance_km: Number(data.hospital_distance_km) || 2.0,
        park_distance_km: Number(data.park_distance_km) || 0.8,
        noise_level: data.noise_level || "low",
        green_score: Number(data.green_score) || 85,
        amenity_score: 90,
        match_score: 88,
        slightly_over_budget: false,
        seller_id: data.seller_id || "usr_seller_01",
        status: "pending", // Pending admin approval
        score_breakdown: {
          budget: { score: 18, max: 20 },
          commute: { score: 18, max: 20 },
          location: { score: 13, max: 15 },
          bhk: { score: 10, max: 10 },
          schools: { score: 8, max: 10 },
          noise: { score: 9, max: 10 },
          parks: { score: 8, max: 10 },
          amenities: { score: 4, max: 5 }
        },
        ai_explanation: "Freshly registered property undergoing automated neural lifestyle indexing.",
        nearby: {
          schools: [{ name: "National Public School", distance_km: 1.5, rating: 4.6 }],
          hospitals: [{ name: "City Health Care Center", distance_km: 2.0 }],
          parks: [{ name: "Peelamedu Green Park", distance_km: 0.8 }],
          transport: [{ name: "Express Bus Stop", type: "Bus Stop", distance_m: 200 }]
        },
        views: 0,
        shortlists: 0,
        enquiries: 0
      };
      propertiesStore = [newProp, ...propertiesStore];
      setStore('properties', propertiesStore);
      return newProp;
    }
    return httpCall('/seller/property', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProperty(propertyId, data) {
    if (getDemoMode()) {
      await mockLatency(350);
      propertiesStore = propertiesStore.map((p) => {
        if (p.property_id === propertyId) {
          return { ...p, ...data };
        }
        return p;
      });
      setStore('properties', propertiesStore);
      return propertiesStore.find((p) => p.property_id === propertyId);
    }
    return httpCall(`/seller/property/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(300);
      propertiesStore = propertiesStore.filter((p) => p.property_id !== propertyId);
      setStore('properties', propertiesStore);
      return { success: true };
    }
    return httpCall(`/seller/property/${propertyId}`, {
      method: 'DELETE'
    });
  },

  async getSellerAnalytics(sellerId) {
    if (getDemoMode()) {
      await mockLatency(300);
      return INITIAL_SELLER_ANALYTICS;
    }
    return httpCall(`/seller/${sellerId}/analytics`);
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
    return httpCall(`/seller/property/${propertyId}/insights`);
  },

  async getEnquiries(sellerId) {
    if (getDemoMode()) {
      await mockLatency(250);
      return enquiriesStore;
    }
    return httpCall(`/seller/${sellerId}/enquiries`);
  },

  async respondToEnquiry(enquiryId, message) {
    if (getDemoMode()) {
      await mockLatency(300);
      enquiriesStore = enquiriesStore.map((enq) => {
        if (enq.enquiry_id === enquiryId) {
          return { ...enq, status: 'responded', response: message };
        }
        return enq;
      });
      setStore('enquiries', enquiriesStore);
      return { success: true };
    }
    return httpCall(`/seller/enquiry/${enquiryId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // ── ADMIN ENDPOINTS ────────────────────────────────────────
  async getAdminAnalytics(period = '30d') {
    if (getDemoMode()) {
      await mockLatency(300);
      return INITIAL_ADMIN_ANALYTICS;
    }
    return httpCall(`/admin/analytics?period=${period}`);
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
        users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return { users, total: users.length };
    }
    return httpCall('/admin/users', {
      params: filters
    });
  },

  async updateUserStatus(userId, status) {
    if (getDemoMode()) {
      await mockLatency(200);
      usersStore = usersStore.map((u) => (u.user_id === userId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
    return httpCall(`/admin/user/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async getSellers(filters = {}) {
    if (getDemoMode()) {
      await mockLatency(250);
      let sellers = usersStore.filter((u) => u.role === 'seller');
      return sellers;
    }
    return httpCall('/admin/sellers');
  },

  async updateSellerStatus(sellerId, status) {
    if (getDemoMode()) {
      await mockLatency(200);
      usersStore = usersStore.map((u) => (u.user_id === sellerId ? { ...u, status } : u));
      setStore('users', usersStore);
      return { success: true };
    }
    return httpCall(`/admin/seller/${sellerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async getProperties(filters = {}) {
    if (getDemoMode()) {
      await mockLatency(250);
      let list = [...propertiesStore];
      if (filters.status && filters.status !== 'all') {
        list = list.filter((p) => p.status === filters.status);
      }
      return list;
    }
    return httpCall('/admin/properties');
  },

  async approveProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(300);
      propertiesStore = propertiesStore.map((p) => (p.property_id === propertyId ? { ...p, status: 'active' } : p));
      setStore('properties', propertiesStore);
      return { success: true };
    }
    return httpCall(`/admin/property/${propertyId}/approve`, {
      method: 'PUT'
    });
  },

  async rejectProperty(propertyId, reason) {
    if (getDemoMode()) {
      await mockLatency(300);
      propertiesStore = propertiesStore.map((p) => (p.property_id === propertyId ? { ...p, status: 'rejected', rejection_reason: reason } : p));
      setStore('properties', propertiesStore);
      return { success: true };
    }
    return httpCall(`/admin/property/${propertyId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  async removeProperty(propertyId) {
    if (getDemoMode()) {
      await mockLatency(250);
      propertiesStore = propertiesStore.filter((p) => p.property_id !== propertyId);
      setStore('properties', propertiesStore);
      return { success: true };
    }
    return httpCall(`/admin/property/${propertyId}`, {
      method: 'DELETE'
    });
  },

  async getReports() {
    if (getDemoMode()) {
      await mockLatency(250);
      return reportsStore;
    }
    return httpCall('/admin/reports');
  },

  async resolveReport(reportId, action) {
    if (getDemoMode()) {
      await mockLatency(250);
      reportsStore = reportsStore.map((r) => (r.report_id === reportId ? { ...r, status: 'resolved', action_taken: action } : r));
      setStore('reports', reportsStore);
      return { success: true };
    }
    return httpCall(`/admin/report/${reportId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ action })
    });
  },

  async getSystemHealth() {
    if (getDemoMode()) {
      await mockLatency(150);
      return {
        backend: "online", // "online" | "offline" | "degraded"
        database: "online",
        ai_service: "online",
        api: "online",
        last_checked: new Date().toISOString()
      };
    }
    return httpCall('/admin/system/health');
  }
};
