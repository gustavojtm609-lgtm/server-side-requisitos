import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve('dist');
const indexPath = path.join(outputDirectory, 'index.html');

await access(indexPath);
const indexHtml = await readFile(indexPath, 'utf8');

if (!indexHtml.includes('<div id="root"></div>')) {
  throw new Error('O HTML de produção não contém o ponto de montagem React.');
}

const assetsDirectory = path.join(outputDirectory, 'assets');
const assetNames = await readdir(assetsDirectory);
const requiredExtensions = ['.js', '.css'];

for (const extension of requiredExtensions) {
  if (!assetNames.some((name) => name.endsWith(extension))) {
    throw new Error(`O pacote não contém um arquivo ${extension}.`);
  }
}

const files = await Promise.all(
  assetNames.map(async (name) => ({
    name,
    size: (await stat(path.join(assetsDirectory, name))).size,
  })),
);

if (files.some((file) => file.size === 0)) {
  throw new Error('O pacote contém um arquivo de asset vazio.');
}

console.log(`Artefato validado: index.html e ${files.length} assets de produção.`);

