import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from './load-env.mjs';

if (process.env.CENTRAL_LICENSE_KEY) {
  process.exit(0);
}

const centralIconsInstalled =
  existsSync(resolve(process.cwd(), 'node_modules/central-icons/package.json')) ||
  existsSync(
    resolve(process.cwd(), 'node_modules/central-icons-filled/package.json'),
  );

if (centralIconsInstalled) {
  process.exit(0);
}

loadEnvFile();

if (process.env.CENTRAL_LICENSE_KEY) {
  console.error(
    [
      '',
      'Central Icons license key is in .env but not loaded into this shell.',
      'Use one of these before installing dependencies:',
      '  npm run install:deps',
      '  direnv allow   (then cd into the project again)',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

const hasEnvFile = existsSync(resolve(process.cwd(), '.env'));

console.error(
  [
    '',
    hasEnvFile
      ? 'CENTRAL_LICENSE_KEY is missing from .env.'
      : 'Missing .env — copy .env.example and add your Central Icons license key.',
    'Then run: npm run install:deps',
    '',
  ].join('\n'),
);
process.exit(1);
