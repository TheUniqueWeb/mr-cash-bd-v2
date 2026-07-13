const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/\s*Fallback offers: ALWAYS add them[\s\S]*?formattedOffers = \[\.\.\.formattedOffers, \.\.\.fallbackOffers\];/m;

const replacement = `// No fallback offers`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
