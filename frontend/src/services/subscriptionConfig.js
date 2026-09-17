// Centralized Subscription Plans and Entitlements Configuration
// SmartNest AI — Unified source of truth for pricing, limits, entitlements, and Razorpay plan IDs.

export const BUYER_PLANS = [
  {
    id: 'free',
    name: 'Free',
    role: 'buyer',
    price: 0,
    currency: 'INR',
    billing_cycle: 'monthly',
    billing_period_text: '₹0 / month',
    razorpay_plan_id: null,
    contact_limit: 1,
    description: 'Explore lifestyle recommendations and test SmartNest verified matching with essential access.',
    popular: false,
    entitlements: {
      contact_limit: 1,
      zero_brokerage: true,
      priority_support: false,
      property_alerts: false,
      relationship_manager: false,
      ai_recommendations: true
    },
    features_list: [
      { name: '1 verified owner contact', included: true },
      { name: 'AI Lifestyle matching & scores', included: true },
      { name: 'Interactive neighborhood comparison', included: true },
      { name: 'Commute & acoustic breakdown', included: true },
      { name: 'Zero brokerage guarantee', included: true }
    ]
  },
  {
    id: 'smart_seller',
    name: 'SmartSeller',
    role: 'buyer',
    price: 699,
    currency: 'INR',
    billing_cycle: 'monthly',
    billing_period_text: '₹699 / month',
    razorpay_plan_id: 'plan_buyer_smart_seller',
    contact_limit: 10,
    description: 'Accelerate your home search with instant owner connections and priority matching alerts.',
    popular: true,
    badge: 'Popular',
    entitlements: {
      contact_limit: 10,
      zero_brokerage: true,
      priority_support: true,
      property_alerts: true,
      relationship_manager: false,
      ai_recommendations: true
    },
    features_list: [
      { name: '10 verified owner contacts', included: true },
      { name: 'Instant price drop & new listing alerts', included: true },
      { name: 'AI commute & school analysis', included: true },
      { name: 'Priority customer support', included: true },
      { name: 'Zero brokerage on all properties', included: true }
    ]
  },
  {
    id: 'relax',
    name: 'Relax',
    role: 'buyer',
    price: 1499,
    currency: 'INR',
    billing_cycle: 'monthly',
    billing_period_text: '₹1,499 / month',
    razorpay_plan_id: 'plan_buyer_relax',
    contact_limit: 30,
    description: 'Premium buyer concierge package with dedicated relationship manager and high-touch guidance.',
    popular: false,
    badge: 'Concierge',
    entitlements: {
      contact_limit: 30,
      zero_brokerage: true,
      priority_support: true,
      property_alerts: true,
      relationship_manager: true,
      ai_recommendations: true
    },
    features_list: [
      { name: 'Up to 30 verified owner contacts', included: true },
      { name: 'Dedicated Relationship Manager', included: true },
      { name: 'Assisted site visit coordination', included: true },
      { name: 'Full acoustic & commute reports', included: true },
      { name: '24/7 priority VIP assistance', included: true }
    ]
  }
];

export const SELLER_PLANS = [
  {
    id: 'connect',
    name: 'Connect',
    role: 'seller',
    price: 500,
    currency: 'INR',
    billing_cycle: '45_days',
    billing_period_text: '₹500 / 45 days',
    razorpay_plan_id: 'plan_seller_connect',
    property_limit: 15,
    description: 'Essential seller connectivity package to list properties and reach verified home seekers.',
    popular: false,
    entitlements: {
      property_limit: 15,
      basic_property_listing: true,
      property_photos: true,
      buyer_enquiries: true,
      basic_buyer_matching: true,
      ai_buyer_matching: true,
      buyer_match_insights: false,
      priority_visibility: false,
      advanced_analytics: false,
      enquiry_management: true,
      advanced_ai_matching: false,
      lead_management: false,
      priority_buyer_connections: false,
      advanced_reports: false,
      team_access: false,
      relationship_manager: false,
      verified_seller_badge: false
    },
    features_list: [
      { name: 'Up to 15 property listings', included: true },
      { name: 'Zero brokerage buyer leads', included: true },
      { name: 'Direct buyer enquiries & alerts', included: true },
      { name: 'Priority customer support', included: true },
      { name: 'Valid for 45 days', included: true },
      { name: 'Admin-approved "Verified Seller" badge', included: false }
    ]
  },
  {
    id: 'connect_plus',
    name: 'Connect+',
    role: 'seller',
    price: 700,
    currency: 'INR',
    billing_cycle: '45_days',
    billing_period_text: '₹700 / 45 days',
    razorpay_plan_id: 'plan_seller_connect_plus',
    property_limit: 25,
    description: 'Our most popular developer package for active sellers exploring multiple prime corridors.',
    popular: true,
    badge: 'Popular',
    entitlements: {
      property_limit: 25,
      basic_property_listing: true,
      property_photos: true,
      buyer_enquiries: true,
      basic_buyer_matching: true,
      ai_buyer_matching: true,
      buyer_match_insights: true,
      priority_visibility: true,
      advanced_analytics: true,
      enquiry_management: true,
      advanced_ai_matching: false,
      lead_management: false,
      priority_buyer_connections: false,
      advanced_reports: false,
      team_access: false,
      relationship_manager: false,
      verified_seller_badge: false
    },
    features_list: [
      { name: 'Up to 25 property listings', included: true },
      { name: 'AI buyer matching & match insights', included: true },
      { name: 'Priority listing visibility in search', included: true },
      { name: 'Direct verified buyer contacts', included: true },
      { name: 'Valid for 45 days', included: true },
      { name: 'Admin-approved "Verified Seller" badge', included: false }
    ]
  },
  {
    id: 'relax',
    name: 'Relax',
    role: 'seller',
    price: 940,
    currency: 'INR',
    billing_cycle: '45_days',
    billing_period_text: '₹940 / 45 days',
    razorpay_plan_id: 'plan_seller_relax',
    property_limit: 50,
    description: 'Complete peace-of-mind seller package with a dedicated relationship manager and exclusive Admin-approved Verified Seller badge.',
    popular: false,
    badge: 'Verified Badge',
    entitlements: {
      property_limit: 50,
      basic_property_listing: true,
      property_photos: true,
      buyer_enquiries: true,
      basic_buyer_matching: true,
      ai_buyer_matching: true,
      buyer_match_insights: true,
      priority_visibility: true,
      advanced_analytics: true,
      enquiry_management: true,
      advanced_ai_matching: true,
      lead_management: true,
      priority_buyer_connections: true,
      advanced_reports: true,
      team_access: true,
      relationship_manager: true,
      verified_seller_badge: true,
      admin_verified_badge: true
    },
    features_list: [
      { name: 'Admin-approved "Verified Seller" badge', included: true, highlight: true },
      { name: 'Up to 50 property listings', included: true },
      { name: 'Dedicated Relationship Manager', included: true },
      { name: 'Advanced AI buyer matching & syndication', included: true },
      { name: 'Priority buyer connections & site-visit coordination', included: true },
      { name: 'Advanced analytics & custom reports', included: true },
      { name: 'Valid for 45 days', included: true }
    ]
  }
];

export const getPlanById = (planId, role) => {
  const pool = role === 'seller' ? SELLER_PLANS : BUYER_PLANS;
  
  // Normalization aliases
  let normalizedId = planId;
  if (role === 'buyer') {
    if (planId === 'connect') normalizedId = 'free';
    if (planId === 'connect_plus') normalizedId = 'smart_seller';
    if (planId === 'smart_buyer' || planId === 'smartseller') normalizedId = 'smart_seller';
  } else if (role === 'seller') {
    if (planId === 'free') normalizedId = 'connect';
    if (planId === 'smart_seller' || planId === 'smart_buyer' || planId === 'smartseller') normalizedId = 'connect_plus';
    if (planId === 'professional') normalizedId = 'relax';
  }

  const found = pool.find((p) => p.id === normalizedId || p.id === planId);
  if (found) return found;
  const anyFound = [...BUYER_PLANS, ...SELLER_PLANS].find((p) => p.id === normalizedId || p.id === planId);
  return anyFound || pool[0];
};

export const getPlanByRazorpayId = (razorpayPlanId) => {
  const all = [...BUYER_PLANS, ...SELLER_PLANS];
  return all.find((p) => p.razorpay_plan_id === razorpayPlanId) || null;
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};
