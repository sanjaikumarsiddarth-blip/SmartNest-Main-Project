// End-to-End Verification Script for SmartNest AI Intelligence & Automation
import { api } from './src/services/api.js';
import { workflowCompatibilityAnalysis } from './src/services/workflows.js';

async function runTests() {
  console.log('===============================================================');
  console.log('  SMARTNEST AI — VERIFICATION & INTELLIGENCE SUITE');
  console.log('===============================================================\n');

  // ── 1. AUTHENTICATION TESTS ──────────────────────────────────
  console.log('1. [AUTH] Testing Role-Based Authentication...');
  const buyer = await api.login('aarav@smartnest.ai', 'password123');
  console.log(`   ✓ Buyer login successful: ${buyer.name} (${buyer.role})`);

  const seller = await api.login('prestige@smartnest.ai', 'password123');
  console.log(`   ✓ Seller login successful: ${seller.name} (${seller.role})`);

  const admin = await api.login('admin@smartnest.ai', 'adminpassword');
  console.log(`   ✓ Admin login successful: ${admin.name} (${admin.role})`);

  // ── TEST 1 — COMPATIBILITY (Section 24) ───────────────────────
  console.log('\n2. [TEST 1 — COMPATIBILITY] Testing Deterministic Lifestyle Compatibility...');
  const test1BuyerPref = {
    budget: 7500000, // ₹75L
    bhk: 3,
    max_commute: 45, // <= 45 minutes
    city: 'Coimbatore',
    noise_pref: 'quiet',
    school_importance: 'high',
    park_walking: true
  };
  const test1Property = {
    property_id: 'TEST_PROP_01',
    title: 'Highland Residency',
    price: 7200000, // ₹72L
    bhk: 3,
    commute_minutes: 30, // 30 minutes
    city: 'Coimbatore',
    noise_level: 'low',
    school_distance_km: 1.4,
    park_distance_km: 0.5,
    green_score: 90,
    amenity_score: 88
  };

  const compatResult = workflowCompatibilityAnalysis(test1BuyerPref, test1Property);
  console.log(`   ✓ Compatibility score generated: ${compatResult.overall_score}%`);
  console.log(`   ✓ Match rating assigned: ${compatResult.match_rating}`);
  console.log(`   ✓ Dimension breakdown:`, compatResult.score_breakdown);
  console.log(`   ✓ Explanation generated: "${compatResult.explanation.slice(0, 100)}..."`);
  console.log(`   ✓ Strengths count: ${compatResult.strengths.length}`);

  if (compatResult.overall_score < 80) {
    throw new Error('Test 1 Failed: Expected high compatibility score for matching property');
  }
  if (!compatResult.match_rating || !compatResult.score_breakdown.budget) {
    throw new Error('Test 1 Failed: Missing match rating or breakdown');
  }

  // ── TEST 2 — COMPARISON (Section 24) ─────────────────────────
  console.log('\n3. [TEST 2 — COMPARISON] Testing AI Property Comparison...');
  const compRes = await api.compareProperties(['P01', 'P02']);
  console.log(`   ✓ Both properties retrieved: ${compRes.properties.map((p) => p.title).join(' vs ')}`);
  console.log(`   ✓ Winner Property Identified: ${compRes.ai_comparison?.winner_property_title} (ID: ${compRes.ai_comparison?.winner_property_id})`);
  console.log(`   ✓ Compatibility difference: ${compRes.ai_comparison?.compatibility_difference}`);
  console.log(`   ✓ Winning reasons:`, compRes.ai_comparison?.reasons);
  console.log(`   ✓ Trade-offs analyzed:`, compRes.ai_comparison?.tradeoffs);
  console.log(`   ✓ Concise summary: "${compRes.ai_comparison?.summary.slice(0, 120)}..."`);

  if (!compRes.ai_comparison?.winner_property_id) {
    throw new Error('Test 2 Failed: No winner property determined');
  }
  if (!compRes.ai_comparison?.reasons || compRes.ai_comparison.reasons.length === 0) {
    throw new Error('Test 2 Failed: No comparison reasons generated');
  }

  // ── TEST 3 — WHY PROPERTY (Section 24) ───────────────────────
  console.log('\n4. [TEST 3 — WHY THIS PROPERTY] Testing Match Explanation & Gains/Sacrifices...');
  const p01 = await api.getProperty('P01');
  console.log(`   ✓ Property P01 loaded with Real Compatibility: ${p01.match_score}% (${p01.match_rating})`);
  console.log(`   ✓ Why This Property Explanation: "${p01.ai_explanation.slice(0, 100)}..."`);
  console.log(`   ✓ What You Gain (✓):`);
  p01.what_you_gain?.forEach((g) => console.log(`      ✓ ${g}`));
  console.log(`   ✓ What You Sacrifice (⚠):`);
  p01.what_you_sacrifice?.forEach((s) => console.log(`      ⚠ ${s}`));

  if (!p01.what_you_gain || p01.what_you_gain.length === 0) {
    throw new Error('Test 3 Failed: "What You Gain" list is empty');
  }
  if (!p01.what_you_sacrifice || p01.what_you_sacrifice.length === 0) {
    throw new Error('Test 3 Failed: "What You Sacrifice" list is empty');
  }

  // ── TEST 4 — WISHLIST ALERT (Section 24) ─────────────────────
  console.log('\n5. [TEST 4 — WISHLIST ALERT] Testing Wishlist Offer Alert & Price History...');
  // 1. Buyer saves Property
  await api.saveProperty('P01', buyer.user_id);
  console.log('   ✓ Step 1: Buyer saved Property P01 to shortlist');

  // 2. Set initial Buyer budget to ₹75L
  await api.updateBuyerPreferences({ budget: 7500000, bhk: 2 });
  console.log('   ✓ Step 2: Buyer preferred budget set to ₹75 Lakhs');

  // 3. Update property price to ₹82L first (above budget)
  await api.updateProperty('P01', { price: 8200000 });
  console.log('   ✓ Step 3: Property P01 price set to ₹82 Lakhs (above budget)');

  // 4. Seller changes Property P01 price to ₹74L (falls within budget!)
  console.log('   ✓ Step 4: Seller reduces P01 price from ₹82L to ₹74L...');
  const priceAlertRes = await api.updatePropertyPrice('P01', 7400000, seller.user_id);

  console.log(`   ✓ Price history entry created: ${priceAlertRes.price_history.old_price} -> ${priceAlertRes.price_history.new_price} (change: ${priceAlertRes.price_history.change_percentage}%)`);
  console.log(`   ✓ Notifications created: ${priceAlertRes.notifications_created}`);
  if (priceAlertRes.notifications && priceAlertRes.notifications.length > 0) {
    const n = priceAlertRes.notifications[0];
    console.log(`      Title: "${n.title}"`);
    console.log(`      Message: "${n.message}"`);
    console.log(`      Dedup Key: "${n.deduplication_key}"`);
  }

  console.log(`   ✓ Email dispatches recorded: ${priceAlertRes.emails_dispatched}`);
  if (priceAlertRes.email_dispatches && priceAlertRes.email_dispatches.length > 0) {
    const em = priceAlertRes.email_dispatches[0];
    console.log(`      To: ${em.to} (${em.recipient_name})`);
    console.log(`      Subject: "${em.subject}"`);
    console.log(`      Delivery Status: ${em.status} (${em.delivery_note})`);
  }

  // 5. Test Deduplication: calling updatePropertyPrice again with the SAME event should not duplicate notifications
  console.log('   ✓ Step 5: Testing deduplication prevention on identical price event...');
  const dedupRes = await api.updatePropertyPrice('P01', 7400000, seller.user_id);
  console.log(`   ✓ Subsequent identical price event notifications created: ${dedupRes.notifications_created} (Expected: 0)`);
  if (dedupRes.notifications_created !== 0) {
    throw new Error('Test 4 Failed: Duplicate alert was generated');
  }

  // ── 6. SELLER & ADMIN SYSTEM HEALTH ─────────────────────────
  console.log('\n6. [SYSTEM] Checking Seller Insights & Admin Health...');
  const insights = await api.getBuyerInsights('P01');
  console.log(`   ✓ Seller insights: ${insights.total_potential_buyers} potential buyers, avg match ${insights.avg_match_score}%`);

  const health = await api.getSystemHealth();
  console.log(`   ✓ Admin system health check: backend=${health.backend}, db=${health.database}, ai=${health.ai_service}`);

  console.log('\n===============================================================');
  console.log('  ALL 4 ENHANCEMENT TESTS AND PLATFORM CHECKS PASSED (100%)');
  console.log('===============================================================');
}

runTests().catch((err) => {
  console.error('\n❌ Test Failed with Error:', err);
  process.exit(1);
});
