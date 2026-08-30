# Groowy Pages

Sito statico pubblico di Groowy, costruito con Astro: landing prodotto,
guide bilingui, risorse legali, supporto account e contesto per potenziali
partner. Gli HTML legacy nella radice restano la fonte autorevole per i
fallback e vengono copiati byte-identici nel build.

## Pagine

- `index.html` — landing prodotto, disponibilità store e accesso alle risorse;
- `partners.html` — contesto prodotto per potenziali partner e future API;
- `privacy-policy.html` — informativa privacy;
- `delete-account.html` — cancellazione in-app e richiesta web;
- `terms-of-service.html` — condizioni d'uso;
- `reset-password.html` — redirect informativo recupero password.

## Sviluppo e verifiche

Richiede Node.js 22.12 o successivo.

```powershell
cd astro
npm ci
npm run check
npm run test:claims
npm run test:legal
npm run test:seo
npm run build
npm run test:legal-render
npm run test:links
npm run test:seo-output
```

`npm run build` sincronizza automaticamente HTML e asset legacy in
`astro/public/`; le copie generate sono ignorate da Git. `astro/public/og.png`
è invece l'asset social versionato usato direttamente dal build.

Il sito non usa analytics, cookie o JavaScript di tracking. Non inserire mai
secret, token, dati utente o log nelle pagine pubbliche.

I link a Google Play e App Store vanno aggiunti solo quando sono gli URL
pubblici e verificati delle rispettive pubblicazioni. La pagina Partner non
deve dichiarare integrazioni bancarie, autorizzazioni regolamentari o
certificazioni non attive e documentate.
