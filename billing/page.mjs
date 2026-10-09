import {api, isPaid, validateConfig, validateCheckout, validatePortal} from './billing_client.mjs';

const byId = (id) => document.getElementById(id);
let config;
let session;
let entitlement;
let epoch = 0;
let busy = false;
let paddleReady = false;
let pendingConfirmation = false;

// Un link di ritorno o un ID in query non costituisce prova di acquisto.
// Il checkout viene aperto solo con l'ID ricevuto dal backend autenticato.
if (location.search) history.replaceState(null, '', location.pathname);

function status(message, error = false) {
  byId('status').textContent = message;
  byId('status').dataset.error = String(error);
}
function render() {
  byId('login').hidden = Boolean(session);
  byId('account').hidden = !session;
  byId('sign-in').disabled = !config || busy;
  const paid = isPaid(entitlement);
  byId('offer').hidden = !session || !entitlement || paid;
  byId('buy').disabled = busy || !session || !entitlement || paid;
  byId('portal').hidden = !paid || entitlement.provider !== 'paddle';
  byId('portal').disabled = busy;
  byId('refresh').disabled = busy;
  byId('interval').disabled = busy;
  byId('plan').textContent = !entitlement ? 'Verifica del piano in corso…' : paid ? `${entitlement.plan === 'bloom' ? 'Bloom' : 'Grow'} è attivo sul tuo account.` : 'Il tuo account utilizza il piano Seed.';
  if (paid && entitlement.provider === 'revenuecat') byId('plan').textContent += ' Gestisci il rinnovo nello store in cui hai acquistato.';
}
async function accessToken(expectedEpoch) {
  if (!session || expectedEpoch !== epoch) throw new Error('account_changed');
  if (session.expiresAt > Date.now() + 30000) return session.access_token;
  const refreshed = await api(config, '/auth/v1/token?grant_type=refresh_token', {body: {refresh_token: session.refresh_token}});
  if (expectedEpoch !== epoch) throw new Error('account_changed');
  session = {...refreshed, expiresAt: Date.now() + refreshed.expires_in * 1000};
  return session.access_token;
}
async function refreshPlan(expectedEpoch = epoch) {
  const token = await accessToken(expectedEpoch);
  const result = await api(config, '/rest/v1/rpc/get_billing_entitlement', {token});
  if (expectedEpoch !== epoch) return false;
  if (!['seed', 'grow', 'bloom'].includes(result.plan) || ![null, 'paddle', 'revenuecat'].includes(result.provider)) throw new Error('invalid_entitlement');
  entitlement = result;
  render();
  return true;
}
function handleError(error, expectedEpoch) {
  if (expectedEpoch !== epoch) return;
  if (error.message === 'session_expired') {
    session = undefined;
    entitlement = undefined;
    epoch++;
    status('La sessione è scaduta. Accedi di nuovo per continuare.', true);
  } else if (error.message === 'subscription_exists') {
    status('È già presente un abbonamento. Aggiorna il piano prima di continuare.', true);
  } else status('Non è stato possibile completare la richiesta. Riprova tra poco.', true);
  render();
}
async function action(operation) {
  if (busy) return;
  const expectedEpoch = epoch;
  busy = true;
  render();
  try { await operation(expectedEpoch); } catch (error) { handleError(error, expectedEpoch); }
  finally { busy = false; render(); }
}
function preparePaddle() {
  if (paddleReady) return;
  if (!window.Paddle) throw new Error('checkout_unavailable');
  if (config.paddleEnvironment === 'sandbox') window.Paddle.Environment.set('sandbox');
  window.Paddle.Initialize({
    token: config.paddleClientToken,
    eventCallback(event) {
      if (event.name !== 'checkout.completed') return;
      pendingConfirmation = true;
      status('Pagamento ricevuto. Verifica dell’attivazione in corso…');
      // La notifica browser non modifica mai il piano: rileggiamo il server.
      void action(async (expectedEpoch) => {
        for (const delay of [0, 1000, 2000, 4000]) {
          if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
          if (epoch !== expectedEpoch || !session) return;
          if (await refreshPlan(expectedEpoch) && isPaid(entitlement)) {
            pendingConfirmation = false;
            status('Il piano è attivo. Apri Groowy e accedi con lo stesso account.');
            return;
          }
        }
        status('La conferma è ancora in corso. Usa “Aggiorna il piano” tra poco.');
      });
    },
  });
  paddleReady = true;
}
byId('login').addEventListener('submit', (event) => {
  event.preventDefault();
  void action(async (expectedEpoch) => {
    status('Accesso in corso…');
    const password = byId('password').value;
    byId('password').value = '';
    const result = await api(config, '/auth/v1/token?grant_type=password', {body: {email: byId('email').value.trim(), password}});
    if (expectedEpoch !== epoch) return;
    if (!result.access_token || !result.refresh_token || !result.user?.id) throw new Error('invalid_session');
    session = {...result, expiresAt: Date.now() + result.expires_in * 1000};
    await refreshPlan(expectedEpoch);
    status('Account collegato.');
  });
});
byId('logout').addEventListener('click', () => {
  const oldToken = session?.access_token;
  epoch++;
  session = undefined;
  entitlement = undefined;
  pendingConfirmation = false;
  if (paddleReady) window.Paddle.Checkout.close();
  if (oldToken) void api(config, '/auth/v1/logout?scope=local', {token: oldToken}).catch(() => {});
  status('Hai disconnesso questo browser.');
  render();
});
byId('refresh').addEventListener('click', () => void action(async (expectedEpoch) => {
  await refreshPlan(expectedEpoch);
  if (epoch === expectedEpoch) status(isPaid(entitlement) ? 'Il piano è attivo. Accedi con lo stesso account nell’app.' : pendingConfirmation ? 'La conferma del pagamento è ancora in corso.' : 'Piano aggiornato.');
}));
byId('buy').addEventListener('click', () => void action(async (expectedEpoch) => {
  await refreshPlan(expectedEpoch);
  if (epoch !== expectedEpoch || isPaid(entitlement)) return;
  const token = await accessToken(expectedEpoch);
  const result = await api(config, '/functions/v1/billing-checkout', {token, body: {plan: 'grow', interval: byId('interval').value}});
  if (epoch !== expectedEpoch) return;
  const transactionId = validateCheckout(result, config.paddleEnvironment);
  preparePaddle();
  window.Paddle.Checkout.open({transactionId, settings: {locale: 'it'}});
  status('Completa il pagamento nella finestra Paddle.');
}));
byId('portal').addEventListener('click', () => void action(async (expectedEpoch) => {
  const token = await accessToken(expectedEpoch);
  const result = await api(config, '/functions/v1/billing-portal', {token});
  if (epoch === expectedEpoch) location.assign(validatePortal(result, config.paddleEnvironment));
}));
try {
  const response = await fetch('./config.json', {cache: 'no-store'});
  if (!response.ok) throw new Error('configuration_missing');
  config = validateConfig(await response.json());
  status(config.paddleEnvironment === 'sandbox' ? 'Ambiente di prova: nessun addebito reale.' : 'Accedi per continuare.');
} catch {
  status('Il servizio di abbonamento non è ancora disponibile.', true);
}
render();
