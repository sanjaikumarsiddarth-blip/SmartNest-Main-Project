// Data Controller for SmartNest AI Backend (Subscriptions, Conversations, User Data)
const { supabase, isSupabaseConfigured } = require('./supabaseClient');

const PLAN_META = {
  buyer: {
    free: { id: 'free', name: 'Free', price: 0, billing_cycle: 'monthly', contact_limit: 1 },
    smart_seller: { id: 'smart_seller', name: 'SmartSeller', price: 699, billing_cycle: 'monthly', contact_limit: 10 },
    smartseller: { id: 'smart_seller', name: 'SmartSeller', price: 699, billing_cycle: 'monthly', contact_limit: 10 },
    relax: { id: 'relax', name: 'Relax', price: 1499, billing_cycle: 'monthly', contact_limit: 30 }
  },
  seller: {
    connect: { id: 'connect', name: 'Connect', price: 500, billing_cycle: '45_days', property_limit: 15 },
    connect_plus: { id: 'connect_plus', name: 'Connect+', price: 700, billing_cycle: '45_days', property_limit: 25 },
    relax: { id: 'relax', name: 'Relax', price: 940, billing_cycle: '45_days', property_limit: 50 }
  }
};

async function getSubscription(req, res) {
  try {
    const { user_id, role = 'buyer' } = req.query;

    // 1. Check Supabase Subscriptions table
    if (isSupabaseConfigured && supabase && user_id) {
      try {
        const { data, error } = await supabase
          .from('Subscriptions')
          .select('*')
          .eq('user_id', user_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const planKey = (data.plan || '').toLowerCase();
          const meta = (PLAN_META[role] && PLAN_META[role][planKey]) || {
            id: data.plan,
            name: data.plan_name || data.plan,
            price: data.amount,
            billing_cycle: role === 'seller' ? '45_days' : 'monthly'
          };
          return res.json({
            subscription_id: data.id || `sub_${data.plan}`,
            user_id: data.user_id,
            session_id: data.session_id,
            role,
            plan: meta.id,
            plan_id: meta.id,
            plan_name: meta.name,
            amount: data.amount || meta.price,
            status: 'active',
            billing_cycle: meta.billing_cycle,
            contact_limit: meta.contact_limit,
            property_limit: meta.property_limit,
            created_at: data.created_at || new Date().toISOString()
          });
        }
      } catch (sbErr) {
        console.warn('[Supabase Subscriptions Query Note]', sbErr.message);
      }
    }

    // 2. Check in-memory store
    try {
      const { subscriptionsDb } = require('./paymentController');
      if (subscriptionsDb && subscriptionsDb.has(user_id)) {
        return res.json(subscriptionsDb.get(user_id));
      }
    } catch (memErr) {}

    // 3. Default fallback
    const defaultMeta = role === 'seller' ? PLAN_META.seller.connect : PLAN_META.buyer.free;
    return res.json({
      subscription_id: `sub_default_${role}`,
      plan_id: defaultMeta.id,
      plan: defaultMeta.id,
      plan_name: defaultMeta.name,
      amount: defaultMeta.price,
      status: 'active',
      billing_cycle: defaultMeta.billing_cycle,
      role,
      user_id: user_id || (role === 'seller' ? 'usr_seller_01' : 'usr_buyer_01'),
      created_at: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

async function getSubscriptionUsage(req, res) {
  try {
    const { user_id, role = 'buyer' } = req.query;
    return res.json({
      user_id: user_id || 'usr_buyer_01',
      role,
      listings_used: 1,
      listings_limit: 5,
      searches_used: 3,
      searches_limit: 100,
      comparisons_used: 1,
      comparisons_limit: 20
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch subscription usage' });
  }
}

async function getConversations(req, res) {
  try {
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

async function getBuyerPreferences(req, res) {
  try {
    const { userId } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('buyer_preferences')
        .select('*')
        .eq('buyer_id', userId)
        .maybeSingle();

      if (!error && data) {
        return res.json(data);
      }
    }

    return res.json({
      budget: 6000000,
      city: 'Coimbatore',
      preferred_bhk: 2,
      workplace: 'Tidel Park Coimbatore',
      max_commute: 30,
      commute_mode: 'Car',
      school_importance: 'high',
      noise_pref: 'quiet',
      park_walking: true,
      amenities: ['Power Backup', 'Gym', 'Covered Parking']
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch buyer preferences' });
  }
}

module.exports = {
  getSubscription,
  getSubscriptionUsage,
  getConversations,
  getBuyerPreferences
};
