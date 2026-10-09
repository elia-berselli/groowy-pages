# Groowy: checkout web candidato

Questa cartella porta nel sito pubblico la pagina già verificata in App-Groowy PR199, integrata su develop45f1af5. Nessuna vendita è attiva: config.json è assente e il client blocca login e checkout senza configurazione valida. I motori di ricerca non devono indicizzare questa pagina durante le prove.

## Hosting
Il sito attuale usa GitHub Pages dalla radice di main, senza dominio personalizzato: dopo approvazione e merge di questa PR, la cartella sarà servita sotto /groowy-pages/billing/. Il link del logo è relativo, compatibile con tale percorso. Nessun link commerciale è aggiunto alla landing o all'app mobile.

Una diversa PR2 contiene il sito Astro: quando verrà integrata, mantenere questi asset in astro/public/billing/ oppure implementare lo stesso flusso nel build. Non pubblicare i file test o credenziali.

## Configurazione e attivazione
1. Approvare esplicitamente il deploy sul progetto Groowy staging sqbegfzmnvphuqcqhnpt.
2. Applicare solo la migrazione20261007204744_hybrid_billing_ledger.sql da App-Groowy e distribuire billing-checkout, billing-portal, paddle-webhook e il nuovo revenuecat-webhook. La migrazione non è idempotente: non ripeterla e non fare db push di migrazioni estranee.
3. Configurare Paddle sandbox: API key e webhook secret solo sul backend, prodotti/prezzi Grow approvati, default payment link corrispondente al percorso effettivo, notifiche webhook necessarie. REVENUECAT_ENVIRONMENT=SANDBOX e DB sandbox devono coincidere.
4. Creare config.json dal file example soltanto dopo aver ottenuto il client token sandbox e la public/publishable key Supabase. Il file è pubblico: mai API key Paddle, webhook secret o service-role. BILLING_ALLOWED_ORIGINS e PADDLE_CHECKOUT_ORIGIN devono usare il dominio effettivo; non assumere che growoh.app punti già a questo hosting.
5. Abilitare soltanto il checkout sandbox e verificare pagamento, rinnovo, cancellazione, rimborso e login stesso account. Bloom resta spento. Nessun pagamento reale o pubblicazione store incluso.

## Verifica
Il codice client/backend proviene dal candidato App-Groowy già testato: Flutter2144, Deno31, SQL4suite, Node5 e browser390px, più CI verde prima e dopo merge. Questa PR deve verificare anche il percorso GitHub Pages e lo stato disabilitato senza config. La prova con veri provider sandbox richiede l'accesso del titolare; le fixture non la sostituiscono.

## Esito preflight9ottobre2026
Staging: tabelle/RPC nuovi assenti, firme e prerequisiti compatibili. Non risultano piani Premium assegnati solo a profiles.plan senza ledger attivo. I record RevenueCat storici non espongono ambiente: installare il nuovo handler che distingue SANDBOX/PRODUCTION prima delle prove.
Paddle: browser sulla pagina login sandbox, nessuna sessione autenticata. CLI Supabase: non autenticata; connettore DB/Edge disponibile per il deploy dopo conferma target. Nessuna modifica remota eseguita.
