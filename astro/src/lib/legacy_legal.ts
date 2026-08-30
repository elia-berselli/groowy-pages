import deleteAccountSource from '../../../delete-account.html?raw';
import privacySource from '../../../privacy-policy.html?raw';
import termsSource from '../../../terms-of-service.html?raw';

export type LegalDocumentKey = 'privacy' | 'terms' | 'deleteAccount';

export interface LegacyLegalDocument {
  canonicalPath: string;
  description: string;
  bodyHtml: string;
  title: string;
}

interface LegalDocumentDefinition {
  canonicalPath: string;
  description: string;
  sourceFile: string;
  sourceHtml: string;
  title: string;
}

const legalDocumentDefinitions: Record<LegalDocumentKey, LegalDocumentDefinition> = {
  privacy: {
    canonicalPath: '/privacy/',
    description: 'Informativa privacy di Groowy: dati, finalità, fornitori, conservazione e diritti.',
    sourceFile: 'privacy-policy.html',
    sourceHtml: privacySource,
    title: 'Privacy',
  },
  terms: {
    canonicalPath: '/terms/',
    description: 'Termini di servizio di Groowy.',
    sourceFile: 'terms-of-service.html',
    sourceHtml: termsSource,
    title: 'Termini di servizio',
  },
  deleteAccount: {
    canonicalPath: '/delete-account/',
    description: 'Come eliminare un account Groowy e i dati associati.',
    sourceFile: 'delete-account.html',
    sourceHtml: deleteAccountSource,
    title: 'Cancella account',
  },
};

const internalLinkTargets: Record<string, string> = {
  'index.html': '/',
  'partners.html': '/partners/open-banking/',
  'privacy-policy.html': '/privacy/',
  'terms-of-service.html': '/terms/',
  'delete-account.html': '/delete-account/',
  'reset-password.html': '/reset-password.html',
};

const extractMainHtml = (sourceHtml: string, sourceFile: string): string => {
  const match = sourceHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) {
    throw new Error(`LEGAL_SOURCE_INVALID main assente: ${sourceFile}`);
  }

  return match[1];
};

// I percorsi cambiano perché il testo viene servito da route Astro; il copy non
// viene alterato. I sorgenti legacy restano l'unica fonte editoriale.
const rewriteInternalLinks = (bodyHtml: string): string => bodyHtml.replace(
  /href=(['"])([^'"]+)\1/g,
  (original, quote: string, href: string) => {
    const target = internalLinkTargets[href];
    return target ? `href=${quote}${target}${quote}` : original;
  },
);

export const getLegacyLegalDocument = (key: LegalDocumentKey): LegacyLegalDocument => {
  const definition = legalDocumentDefinitions[key];

  return {
    canonicalPath: definition.canonicalPath,
    description: definition.description,
    bodyHtml: rewriteInternalLinks(extractMainHtml(definition.sourceHtml, definition.sourceFile)),
    title: definition.title,
  };
};
