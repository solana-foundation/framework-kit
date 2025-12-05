import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDir = join(process.cwd(), 'dist');
const files = readdirSync(distDir)
	.filter((f) => f.endsWith('.mjs'))
	.filter((f) => !f.includes('.map'));

console.log('\nBundle Analysis\n');
console.log('File'.padEnd(30), 'Size'.padEnd(12), 'Gzipped');
console.log('-'.repeat(60));

let total = 0;
for (const file of files) {
	const content = readFileSync(join(distDir, file));
	const size = statSync(join(distDir, file)).size;
	const gzipSize = gzipSync(content).length;

	total += size;
	console.log(file.padEnd(30), `${(size / 1024).toFixed(2)} KB`.padEnd(12), `${(gzipSize / 1024).toFixed(2)} KB`);
}

console.log('-'.repeat(60));
console.log('Total'.padEnd(30), `${(total / 1024).toFixed(2)} KB`);
console.log('\n');
