import Stripe from 'stripe';
import { ENV } from '../server/_core/env.js';

const stripe = new Stripe(ENV.stripeSecretKey);

async function check() {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('--- STRIPE STATUS REPORT ---');
    console.log('Account:', account.id, account.business_profile.name || account.email);
    console.log('Capabilities (Card Payments):', account.capabilities.card_payments);
    console.log('Dashboard (Payouts):', account.payouts_enabled ? 'Enabled' : 'Disabled');

    // List Domains
    const domains = await stripe.applePayDomains.list({ limit: 10 });
    console.log('\nVerified Domains (Apple Pay):');
    domains.data.forEach(d => console.log(' -', d.domain_name));
    
    if (!domains.data.find(d => d.domain_name === 'bishouy.com')) {
      console.log('\n[!] Domain "bishouy.com" is NOT verified for Apple Pay in Stripe.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
