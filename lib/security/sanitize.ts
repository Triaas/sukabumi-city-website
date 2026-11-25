import sanitizeHtml from 'sanitize-html';

export interface SanitizeUrlOptions {
  allowRelative?: boolean;
  allowHttp?: boolean;
  allowMailtoTel?: boolean;
  allowHash?: boolean;
  fallback?: string;
}

const SINGLE_SLASH_PATH_REGEX = /^\/(?![\/\\])/;
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

export function sanitizeSafeUrl(
  url: string | null | undefined,
  options?: SanitizeUrlOptions
): string {
  const fallback = options?.fallback ?? '';
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const cleaned = url.replace(CONTROL_CHARS_REGEX, '').trim();
  if (!cleaned) {
    return fallback;
  }

  const allowHash = options?.allowHash ?? false;
  if (cleaned === '#' || cleaned.startsWith('#')) {
    return allowHash ? cleaned : fallback;
  }

  const allowRelative = options?.allowRelative ?? true;
  if (cleaned.startsWith('/')) {
    return allowRelative && SINGLE_SLASH_PATH_REGEX.test(cleaned)
      ? cleaned
      : fallback;
  }

  try {
    const parsed = new URL(cleaned);
    const protocol = parsed.protocol.toLowerCase();

    if (protocol === 'https:') {
      return parsed.hostname ? cleaned : fallback;
    }

    if (protocol === 'http:' && options?.allowHttp !== false) {
      return parsed.hostname ? cleaned : fallback;
    }

    if (
      options?.allowMailtoTel &&
      (protocol === 'mailto:' || protocol === 'tel:')
    ) {
      return cleaned;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function sanitizeCssBackgroundUrl(
  url: string | null | undefined
): string {
  const safe = sanitizeSafeUrl(url, {
    allowRelative: true,
    allowHttp: true,
    allowHash: false,
    fallback: '',
  });
  if (!safe) {
    return '';
  }

  return safe.replace(/(["\\])/g, '\\$1');
}

const ALLOWED_RICH_TEXT_TAGS = [
  'p',
  'br',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'hr',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'span',
  'div',
  'figure',
  'figcaption',
];

export function sanitizeRichTextHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_RICH_TEXT_TAGS,
    allowedAttributes: {
      '*': ['class', 'title', 'id'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'colwidth'],
      td: ['colspan', 'rowspan', 'colwidth'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const safeHref = sanitizeSafeUrl(attribs.href, {
          allowRelative: true,
          allowHttp: true,
          allowMailtoTel: true,
          allowHash: true,
          fallback: '',
        });

        const nextAttribs: Record<string, string> = {};
        if (attribs.class) nextAttribs.class = attribs.class;
        if (attribs.title) nextAttribs.title = attribs.title;
        if (attribs.id) nextAttribs.id = attribs.id;

        if (safeHref) {
          nextAttribs.href = safeHref;
          if (attribs.target === '_blank') {
            nextAttribs.target = '_blank';
            nextAttribs.rel = 'noopener noreferrer';
          } else if (attribs.target === '_self') {
            nextAttribs.target = '_self';
          }
        }

        return { tagName, attribs: nextAttribs };
      },
      img: (tagName, attribs) => {
        const safeSrc = sanitizeSafeUrl(attribs.src, {
          allowRelative: true,
          allowHttp: true,
          allowMailtoTel: false,
          allowHash: false,
          fallback: '',
        });

        if (!safeSrc) {
          return { tagName: 'span', attribs: {} };
        }

        const nextAttribs: Record<string, string> = { src: safeSrc };
        if (attribs.alt !== undefined) nextAttribs.alt = attribs.alt;
        if (attribs.class) nextAttribs.class = attribs.class;
        if (attribs.title) nextAttribs.title = attribs.title;
        if (attribs.id) nextAttribs.id = attribs.id;
        if (attribs.width) nextAttribs.width = attribs.width;
        if (attribs.height) nextAttribs.height = attribs.height;
        if (attribs.loading === 'lazy' || attribs.loading === 'eager') {
          nextAttribs.loading = attribs.loading;
        }

        return { tagName, attribs: nextAttribs };
      },
    },
  });
}
