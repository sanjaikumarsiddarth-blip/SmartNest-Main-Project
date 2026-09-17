// Lead & AI Agent Webhook Controller for SmartNest AI
// Automatically dispatches high-intent buyer enquiries to external AI agent workflow

const DEFAULT_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/f3cfc0da-92a5-4c1d-992e-d5f668a47f4b';

function getAgentWebhookUrl() {
  return process.env.SNS_SELLER_WEBHOOK_URL || process.env.SNS_AGENT_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
}

/**
 * Dispatches a formatted lead payload to the configured SNS iHub Agent Webhook.
 */
async function dispatchLeadWebhook(leadData) {
  const webhookUrl = getAgentWebhookUrl();

  if (!webhookUrl) {
    console.warn('[SNS Agent Webhook] No webhook URL configured. Skipping dispatch.');
    return { dispatched: false, error: 'Webhook URL not configured' };
  }

  const payload = {
    event: 'lead_enquiry',
    source: 'SmartNest AI Platform',
    timestamp: new Date().toISOString(),
    lead: {
      enquiry_id: leadData.enquiry_id || `enq_${Date.now()}`,
      message: leadData.message || leadData.enquiryMessage || 'Buyer expressed strong interest in property.',
      intent: leadData.intent || 'High-Intent Buyer Lead',
      match_score: leadData.match_score ?? leadData.matchScore ?? 95,
      conversation_id: leadData.conversation_id || null
    },
    buyer: {
      id: leadData.buyer?.id || leadData.buyer_id || 'usr_buyer_01',
      name: leadData.buyer?.name || leadData.buyer_name || 'Interested Buyer',
      email: leadData.buyer?.email || leadData.buyer_email || 'buyer@smartnest.ai',
      phone: leadData.buyer?.phone || leadData.buyer_phone || '+91 98401 23456'
    },
    seller: {
      id: leadData.seller?.id || leadData.seller_id || 'S001',
      name: leadData.seller?.name || leadData.seller_name || 'Verified Developer',
      email: leadData.seller?.email || leadData.seller_email || 'sales@developer.com',
      phone: leadData.seller?.phone || leadData.seller_phone || '+91 98765 43210'
    },
    property: {
      id: leadData.property?.id || leadData.property_id || 'P01',
      title: leadData.property?.title || leadData.property_title || 'SmartNest Residence',
      price: leadData.property?.price || leadData.property_price || 0,
      price_formatted: leadData.property?.price_formatted || (leadData.property_price ? `₹${(leadData.property_price / 100000).toFixed(1)} Lakhs` : 'Contact for Price'),
      location: leadData.property?.location || leadData.property_location || 'Coimbatore',
      city: leadData.property?.city || 'Coimbatore',
      bhk: leadData.property?.bhk || 2,
      type: leadData.property?.type || 'Apartment'
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SmartNest-AI-Agent-Gateway/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    let responseData = null;
    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : { status: response.status };
    } catch (_) {
      responseData = { status: response.status };
    }

    console.log(`[SNS Agent Webhook] Successfully sent lead enquiry to: ${webhookUrl} (Status: ${response.status})`);
    return {
      dispatched: true,
      statusCode: response.status,
      ok: response.ok,
      data: responseData
    };
  } catch (err) {
    console.error(`[SNS Agent Webhook] Failed to dispatch to ${webhookUrl}:`, err.message);
    return {
      dispatched: false,
      error: err.message
    };
  }
}

/**
 * POST /api/leads/enquiry and POST /api/property/:id/enquiry
 */
async function handleLeadEnquiry(req, res) {
  try {
    const propertyId = req.params.id || req.body.property_id;
    const {
      message,
      session_id,
      buyer_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      seller_id,
      seller_name,
      seller_email,
      seller_phone,
      property_title,
      property_price,
      property_location,
      match_score
    } = req.body;

    const leadData = {
      enquiry_id: `enq_${Date.now()}`,
      message: message || req.body.initial_message || 'Interested in property details',
      match_score: match_score || 95,
      property_id: propertyId,
      property_title,
      property_price,
      property_location,
      buyer_id: buyer_id || session_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      seller_id,
      seller_name,
      seller_email,
      seller_phone
    };

    // Non-blocking asynchronous dispatch so buyer UI experiences 0 latency
    dispatchLeadWebhook(leadData).catch((err) => {
      console.warn('[SNS Agent Webhook] Background lead dispatch note:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: 'Enquiry received and dispatched to SNS iHub AI agent workflow.',
      enquiry_id: leadData.enquiry_id,
      target_webhook: getAgentWebhookUrl()
    });
  } catch (err) {
    console.error('Error handling lead enquiry:', err);
    return res.status(500).json({
      error: 'Failed to process lead enquiry',
      details: err.message
    });
  }
}

/**
 * POST /api/leads/test-webhook
 * Trigger a sample high-intent lead test to verify agent webhook connectivity
 */
async function testLeadWebhook(req, res) {
  try {
    const sampleLead = {
      enquiry_id: `test_enq_${Date.now()}`,
      intent: 'High-Intent Buyer Enquiry (Test Trigger)',
      message: 'Hello! I am ready to schedule a private site visit for Green Valley Residency 3BHK this weekend. Please connect me with the developer team.',
      match_score: 97,
      buyer: {
        id: 'usr_buyer_test',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98401 23456'
      },
      seller: {
        id: 'S001',
        name: 'Prestige Developers',
        email: 'sales@prestigedevelopers.in',
        phone: '+91 98765 43210'
      },
      property: {
        id: 'P01',
        title: 'Green Valley Residency 3BHK',
        price: 8500000,
        price_formatted: '₹85.0 Lakhs',
        location: 'Avinashi Road, Peelamedu, Coimbatore',
        city: 'Coimbatore',
        bhk: 3,
        type: 'Apartment'
      }
    };

    const webhookResult = await dispatchLeadWebhook(sampleLead);

    return res.status(200).json({
      success: true,
      message: 'Test lead trigger sent to SNS iHub AI Agent webhook.',
      target_url: getAgentWebhookUrl(),
      webhook_result: webhookResult,
      sample_payload: sampleLead
    });
  } catch (err) {
    console.error('Error testing lead webhook:', err);
    return res.status(500).json({
      error: 'Test webhook failed',
      details: err.message
    });
  }
}

module.exports = {
  dispatchLeadWebhook,
  handleLeadEnquiry,
  testLeadWebhook,
  getAgentWebhookUrl
};
