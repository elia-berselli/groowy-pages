---
title: "Privacy offline per finanze personali"
description: "Cosa significa offline-first per una app di finanza personale: base locale, scelte esplicite per cloud e AI, limiti e controlli."
h1: "Privacy offline: capire cosa resta sul dispositivo e cosa scegli di attivare"
eyebrow: "Guida · privacy offline"
locale: "it"
translationKey: "offline-privacy"
canonicalPath: "/privacy-offline/"
alternatePath: "/en/offline-privacy/"
searchIntent: "Cosa significa davvero offline-first per i miei dati finanziari e quali servizi possono usare dati esterni?"
family: "privacy"
status: "review"
indexing: "index"
productStatus: "beta"
order: 4
claimRefs: ["PRODUCT-OFFLINE-FIRST-001", "PARTNER-AIS-READONLY-001"]
evidenceRefs: ["docs/core/DATABASE_DEEP_DIVE.md", "docs/features/ocr_pipeline.md", "docs/features/cloud_backup.md"]
author: "Elia Berselli"
reviewer: "Revisione editoriale Groowy"
updatedAt: "2026-08-17"
---

“Offline-first” non vuol dire che nessun dato può mai uscire dal telefono. Vuol dire che il registro personale parte dal dispositivo e non richiede un conto bancario collegato per avere una funzione di base. È un punto di partenza, non uno slogan assoluto.

## Distingui base locale e funzioni opzionali

Cloud, backup, gruppi, servizi AI e future integrazioni hanno scopi diversi. Prima di attivarli, la domanda utile è sempre la stessa: *quale dato serve, dove va, per quanto tempo e come posso smettere?* Per questo una funzione esterna non dovrebbe apparire come un prerequisito silenzioso per usare il registro personale.

## Una scansione non elimina il tuo controllo

Quando una funzione assistiva propone dati da un documento, il risultato richiede verifica prima del salvataggio. Per informazioni di pagamento il limite è ancora più stretto: niente PAN completo, CVC/CVV, PIN, foto fronte/retro o OCR grezzo come archivio. Consulta [Sicurezza e dati](/security/) per il perimetro verificato e [l'informativa completa](/privacy/) per il testo legale autorevole.

## Le connessioni bancarie non sono presenti oggi

L'eventuale accesso AIS in sola lettura è una direzione di roadmap, non un provider già collegato né una partnership annunciata. Se e quando verrà valutato, consenso, revoca, minimizzazione e provider regolamentato saranno condizioni da verificare prima del pilot. La pagina [partner AIS](/partners/open-banking/) distingue esplicitamente questa direzione dal prodotto disponibile.

Per usare una base locale con più ordine, torna a [spese personali](/spese/) o alla guida su [documenti e ricevute](/documenti/).
