// Client pubblico: nessuna chiave Paddle privata, entitlement solo dal backend.
export function validateConfig(input) {
  const url = new URL(input.supabaseUrl);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co') || url.username || url.password || url.pathname !== '/') throw new Error('invalid_configuration');
  const key = input.supabasePublishableKey;
  if (typeof key !== 'string' || !(key.startsWith('sb_publishable_') || key.startsWith('eyJ')) || key.includes('service_role')) throw new Error('invalid_configuration');
  if (key.startsWith('eyJ')) {
    try {
      const encoded = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(encoded));
      if (payload.role !== 'anon') throw new Error();
    } catch { throw new Error('invalid_configuration'); }
  }
  if (!['sandbox', 'live'].includes(input.paddleEnvironment)) throw new Error('invalid_configuration');
  if (typeof input.paddleClientToken !== 'string' || !input.paddleClientToken.startsWith(input.paddleEnvironment === 'sandbox' ? 'test_' : 'live_')) throw new Error('invalid_configuration');
  return Object.freeze({...input, supabaseUrl: url.origin});
}

export function validateCheckout(result, environment) {
  if (result.environment !== environment || !/^txn_[a-z0-9]{26}$/.test(result.transaction_id)) throw new Error('invalid_checkout');
  return result.transaction_id;
}

export function validatePortal(result, environment) {
  const url = new URL(result.portal_url);
  const host = environment === 'sandbox' ? 'sandbox-customer-portal.paddle.com' : 'customer-portal.paddle.com';
  if (result.environment !== environment || url.protocol !== 'https:' || url.hostname !== host || url.username || url.password) throw new Error('invalid_portal');
  return url.href;
}

export function isPaid(entitlement, now = Date.now()) {
  if (!['grow', 'bloom'].includes(entitlement?.plan)) return false;
  return entitlement.valid_until === null || (Number.isFinite(Date.parse(entitlement.valid_until)) && Date.parse(entitlement.valid_until) > now);
}

export async function api(config, path, {token, body, signal} = {}) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    method: 'POST', signal,
    headers: {'Content-Type': 'application/json', apikey: config.supabasePublishableKey, ...(token ? {Authorization: `Bearer ${token}`} : {})},
    body: JSON.stringify(body ?? {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Non propagare payload auth/provider che possono contenere dati personali.
    const error = new Error(response.status === 401 ? 'session_expired' : response.status === 409 ? 'subscription_exists' : 'request_failed');
    error.status = response.status;
    throw error;
  }
  return result;
}
