---
title: "Organise documents and receipts"
description: "How to turn documents and receipts into verifiable references, without treating a scan as an endless archive."
h1: "Documents and receipts: capture the reference, then check it"
eyebrow: "Guide · documents"
locale: "en"
translationKey: "documents-and-receipts"
canonicalPath: "/en/documents/"
alternatePath: "/documenti/"
searchIntent: "How can I keep useful receipts and documents organised without storing images and data I do not need?"
family: "document"
status: "review"
indexing: "index"
productStatus: "beta"
order: 2
claimRefs: ["PRODUCT-OFFLINE-FIRST"]
evidenceRefs: ["docs/features/ocr_pipeline.md", "lib/services/card_scan_service.dart"]
author: "Elia Berselli"
reviewer: "Groowy editorial review"
updatedAt: "2026-08-17"
---

A useful receipt is not always an image to retain forever. Often the useful part is the reference: merchant, date, amount, category or a note that lets you find the expense when it matters.

## Capture with a clear purpose

Before using a camera, ask which information you need. For everyday spending, checking the fields and saving them with the transaction may be enough; for a warranty or expense report, you may also need the original document, handled according to your own needs and applicable requirements. Automated reading can suggest fields, but it does not replace human review or certify a document.

## Payment data: stop before taking the image

A payment card is not a document to archive. The release-candidate perimeter is intentionally minimal: do not retain a full PAN, CVC/CVV, PIN, magnetic-stripe or chip data, front/back images or raw OCR. If you need to identify a card, keep only the strictly useful reference and never photograph its back. See [Security and data](/en/security/) for the current technical perimeter.

## Keep content separate from proof

Extracted text can help you search and classify; any original remains a document to handle carefully. Do not send material to external services unless you chose to share it, and do not scan uncertain sensitive information. Where AI features are available, consent and result review come before saving.

If you want to understand the financial impact of receipts, continue with [personal spending](/en/expenses/). For the local, cloud and backup perimeter, read [offline privacy](/en/offline-privacy/).
