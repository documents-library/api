const sanitizeHtml = require('sanitize-html')

function isFileType({ file, typeNames, mimeTypes }) {
  const { fileExtension, mimeType } = file

  let hasFileExtension = false
  let hasMimeType = false

  if (typeNames) hasFileExtension = typeNames.includes(fileExtension)
  if (mimeTypes) hasMimeType = mimeTypes.includes(mimeType)

  return hasFileExtension || hasMimeType
}

const fileCanBeExportedToHtml = {
  typeNames: ['doc', 'docx', 'odt', 'htm', 'html', 'rtf', 'txt'],
  mimeTypes: ['application/vnd.google-apps.document']
}

function sanitizeFile(html) {
  return sanitizeHtml(html, {
    allowedTags: [
      'a',
      'abbr',
      'acronym',
      'address',
      'area',
      'article',
      'aside',
      'audio',
      'b',
      'base',
      'bdi',
      'bdo',
      'blockquote',
      'br',
      'button',
      'canvas',
      'caption',
      'cite',
      'code',
      'col',
      'colgroup',
      'data',
      'datalist',
      'dd',
      'del',
      'details',
      'dfn',
      'dialog',
      'div',
      'dl',
      'dt',
      'em',
      'figcaption',
      'figure',
      'font',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hr',
      'i',
      'img',
      'input',
      'li',
      'main',
      'map',
      'mark',
      'meta',
      'meter',
      'nav',
      'ol',
      'optgroup',
      'option',
      'output',
      'p',
      'param',
      'picture',
      'pre',
      'progress',
      'q',
      'rp',
      'rt',
      's',
      'samp',
      'section',
      'select',
      'small',
      'span',
      'strong',
      'sub',
      'summary',
      'sup',
      'svg',
      'table',
      'tbody',
      'td',
      'tfoot',
      'th',
      'thead',
      'time',
      'title',
      'tr',
      'u',
      'ul',
      'video',
      'wbr',
      'style'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      p: ['style', 'class'],
      span: ['style', 'class'],
      img: ['style', 'class', 'src']
    },
    nonTextTags: ['style', 'script', 'textarea', 'noscript'],
    allowedStyles: {
      '*': {
        // Match HEX and RGB
        color: [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
        ],
        'text-align': [/^left$/, /^right$/, /^center$/],
        // Match any number with px, em, or %
        'font-size': [/^\d+(?:px|em|%)$/],
        'font-weight': [/^bold/, /^bolder/, /^lighter/, /^\d+$/],
        width: [/^\d+(\.\d{1,2})+(?:px|em|%)$/],
        height: [/^\d+(\.\d{1,2})+(?:px|em|%)$/]
      }
    },
    allowedSchemes: ['http', 'https', 'mailto']
  })
}

module.exports = { isFileType, fileCanBeExportedToHtml, sanitizeFile }
