---
title: "Organizzare documenti e ricevute"
description: "Come trasformare documenti e ricevute in riferimenti verificabili, senza confondere una scansione con un archivio infinito."
h1: "Documenti e ricevute: acquisisci il riferimento, poi controllalo"
eyebrow: "Guida · documenti"
locale: "it"
translationKey: "documents-and-receipts"
canonicalPath: "/documenti/"
alternatePath: "/en/documents/"
searchIntent: "Come posso tenere in ordine ricevute e documenti utili senza salvare immagini e dati che non mi servono?"
family: "document"
status: "review"
indexing: "index"
productStatus: "beta"
order: 2
claimRefs: ["PRODUCT-OFFLINE-FIRST"]
evidenceRefs: ["docs/features/ocr_pipeline.md", "lib/services/card_scan_service.dart"]
author: "Elia Berselli"
reviewer: "Revisione editoriale Groowy"
updatedAt: "2026-08-17"
---

Una ricevuta utile non è sempre un'immagine da conservare per sempre. Spesso ciò che serve davvero è il riferimento: esercente, data, importo, categoria o una nota che renda ritrovabile la spesa quando serve.

## Acquisisci con uno scopo preciso

Prima di usare la fotocamera, chiediti quale informazione vuoi recuperare. Per una spesa quotidiana può bastare verificare i dati e salvarli nel movimento; per una garanzia o una nota spese può servire anche il documento originale, gestito secondo le tue necessità e gli obblighi applicabili. Una lettura automatica può proporre campi, ma non sostituisce il controllo umano né certifica il documento.

## Dati di pagamento: fermati prima dell'immagine

Una carta di pagamento non è un documento da archiviare. Per la release candidate il perimetro di prodotto è minimale: non conservare PAN completo, CVC/CVV, PIN, dati di banda o chip, né immagini fronte/retro o OCR grezzo. Se devi riconoscere una carta, usa solo il riferimento strettamente utile e non fotografarne il retro. Il dettaglio tecnico e i limiti aggiornati sono nella pagina [Sicurezza e dati](/security/).

## Tieni separati contenuto e prova

Un testo estratto ti aiuta a cercare e classificare; l'eventuale originale resta un documento da trattare con prudenza. Non inviare a servizi esterni materiale che non hai scelto di condividere e non usare la scansione per dati sensibili incerti. Le funzioni AI, quando presenti, richiedono consenso e un risultato da verificare prima del salvataggio.

Se il tuo obiettivo è capire l'impatto economico delle ricevute, continua con [come organizzare le spese](/spese/). Per il perimetro locale, cloud e di backup, leggi [privacy offline](/privacy-offline/).
