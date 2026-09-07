// Node verification script for SmartNest mock backend
import { api } from './src/services/api.js';

async function runTests() {
  console.log('Testing SmartNest AI API Gateway...');

  // 1. Auth Tests
  console.log('1. Testing Auth...');
  const buyer = await api.login('aarav@smartnest.ai', 'password123');
  console.log('   ✓ Buyer login successful:', buyer.name, buyer.role);

  const seller = await api.login('prestige@smartnest.ai', 'password123');
  console.log('   ✓ Seller login successful:', seller.name, seller.role);

  const admin = await api.login('admin@smartnest.ai', 'adminpassword');
  console.log('   ✓ Admin login successful:', admin.name, admin.role);

  // 2. Buyer Lifestyle & Recommendations
  console.log('2. Testing Buyer Flow...');
  const profile = await api.analyzeLifestyle({
    budget: 5500000,
    city: 'Coimbatore',
    commute_mode: 'Car',
    max_commute: 25,
    priorities: ['commute', 'budget', 'schools']
  });
  console.log('   ✓ Lifestyle profile generated:', profile.lifestyle_type);
  console.log('   ✓ Dealbreakers count:', profile.dealbreakers.length);

  const recs = await api.getRecommendations({ max_price: 6000000, bhk: [2] });
  console.log('   ✓ Recommendations count for 2BHK <= 60L:', recs.properties.length);
  if (recs.properties.length === 0) throw new Error('Expected at least 1 match');

  const p01 = await api.getProperty('P01');
  console.log('   ✓ P01 loaded:', p01.title, `(${p01.match_score}% match)`);

  const comparison = await api.compareProperties(['P01', 'P02', 'P03']);
  console.log('   ✓ Comparison generated for 3 properties. Summary length:', comparison.ai_comparison_summary.length);

  // 3. Seller Tools
  console.log('3. Testing Seller Tools...');
  const sellerProps = await api.getSellerProperties(seller.user_id);
  console.log('   ✓ Seller properties count:', sellerProps.length);

  const insights = await api.getBuyerInsights('P01');
  console.log('   ✓ P01 Buyer Insights loaded. Potential buyers:', insights.total_potential_buyers);
  console.log('   ✓ Match tiers count:', insights.match_tiers.length);

  // 4. Admin Operations
  console.log('4. Testing Admin Operations...');
  const adminStats = await api.getAdminAnalytics('30d');
  console.log('   ✓ Admin stats loaded. Total users:', adminStats.total_users);

  const health = await api.getSystemHealth();
  console.log('   ✓ System health check:', health.backend, health.database, health.ai_service, health.api);

  console.log('\nAll API backend verification tests PASSED with 100% success!');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
