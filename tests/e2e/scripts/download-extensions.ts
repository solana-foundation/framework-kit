/**
 * Script to download wallet browser extensions for E2E testing.
 *
 * Usage: pnpm download-extensions
 *
 * This script downloads the latest versions of supported wallet extensions
 * and extracts them to the extensions/ directory.
 *
 * Note: Extension IDs and download URLs may change. Update this script
 * when wallet extensions release new versions or change their distribution.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import { execSync } from 'node:child_process';

const EXTENSIONS_DIR = path.resolve(__dirname, '../extensions');

/**
 * Known Chrome Web Store extension IDs.
 * These are the official extension IDs for each wallet.
 */
const EXTENSION_IDS = {
    phantom: 'bfnaelmomeimhlpmgjnjophhpkkoljpa',
    solflare: 'bhhhlbepdkbapadjdnnojkbgioiodbic',
    backpack: 'aflkmfkvkplnmpjfmgmklciillbpgpfo',
} as const;

/**
 * Download a Chrome extension CRX file.
 * Note: Chrome Web Store doesn't allow direct CRX downloads anymore.
 * This is a placeholder for manual download instructions.
 */
async function downloadExtension(name: string, extensionId: string): Promise<void> {
    const outputDir = path.join(EXTENSIONS_DIR, name);

    console.log(`\n📦 ${name} (${extensionId})`);
    console.log(`   Output: ${outputDir}`);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if extension is already downloaded
    const manifestPath = path.join(outputDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        console.log(`   ✓ Already downloaded`);
        return;
    }

    console.log(`   ⚠ Manual download required:`);
    console.log(`   1. Install the extension in Chrome`);
    console.log(`   2. Go to chrome://extensions`);
    console.log(`   3. Enable "Developer mode"`);
    console.log(`   4. Find the extension and note its ID`);
    console.log(`   5. The extension files are at:`);
    console.log(`      Linux: ~/.config/google-chrome/Default/Extensions/${extensionId}/`);
    console.log(`      macOS: ~/Library/Application Support/Google/Chrome/Default/Extensions/${extensionId}/`);
    console.log(`      Windows: %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Extensions\\${extensionId}\\`);
    console.log(`   6. Copy the version folder contents to: ${outputDir}`);
}

async function main() {
    console.log('🔧 Wallet Extension Download Helper');
    console.log('===================================');
    console.log(`\nExtensions directory: ${EXTENSIONS_DIR}`);

    // Ensure extensions directory exists
    if (!fs.existsSync(EXTENSIONS_DIR)) {
        fs.mkdirSync(EXTENSIONS_DIR, { recursive: true });
    }

    // Create .gitignore to exclude downloaded extensions
    const gitignorePath = path.join(EXTENSIONS_DIR, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, '*\n!.gitignore\n!README.md\n');
    }

    // Create README with instructions
    const readmePath = path.join(EXTENSIONS_DIR, 'README.md');
    if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(
            readmePath,
            `# Wallet Extensions for E2E Testing

This directory contains unpacked wallet browser extensions for E2E testing.

## Setup Instructions

1. Install the wallet extensions in Chrome:
   - [Phantom](https://chrome.google.com/webstore/detail/phantom/${EXTENSION_IDS.phantom})
   - [Solflare](https://chrome.google.com/webstore/detail/solflare/${EXTENSION_IDS.solflare})
   - [Backpack](https://chrome.google.com/webstore/detail/backpack/${EXTENSION_IDS.backpack})

2. Enable Developer Mode in chrome://extensions

3. Copy extension files to this directory:
   - Each wallet should have its own subdirectory (phantom/, solflare/, backpack/)
   - Copy the contents of the version folder, not the version folder itself
   - The directory should contain manifest.json at the root

## Directory Structure

\`\`\`
extensions/
├── phantom/
│   ├── manifest.json
│   └── ...
├── solflare/
│   ├── manifest.json
│   └── ...
└── backpack/
    ├── manifest.json
    └── ...
\`\`\`

## Notes

- Extensions are gitignored to avoid distributing proprietary code
- Extension versions may need to be updated periodically
- Some tests may be skipped if extensions are not available
`
        );
    }

    // Process each extension
    for (const [name, id] of Object.entries(EXTENSION_IDS)) {
        await downloadExtension(name, id);
    }

    console.log('\n✅ Done! Follow the manual instructions above to set up extensions.');
}

main().catch(console.error);
