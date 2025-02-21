/**
 * build.js
 * The project uses js-tiktoken to cut down text to avoid exceeding LLM's context length.
 * However, js-tiktoken has all encodings hard-coded into its code (node_modules/js-tiktoken/dist/index.cjs and node_modules/js-tiktoken/dist/index.js),
 * which makes the build output quite large.
 * 
 * I've analyzed the import dependencies and found that the
 * `@tavily/core` SDK also uses js-tiktoken's `cl100k_base` encoding.
 * So basically only `cl100k_base` (for tavily) and `o200k_base` (for our project) are needed.
 * 
 * So I wrote this script to override the encodings in `@tavily/core` to `o200k_base`
 * and clean up unused js-tiktoken encodings in the build output,
 * making the build output smaller by about 3 MB.
*/

import { execSync } from 'child_process';
import fs from 'fs';

// Change Tavily SDK's js-tiktoken to use `o200k_base`
const tavilyFilePaths = ['node_modules/@tavily/core/dist/index.js', 'node_modules/@tavily/core/dist/index.mjs'];
const tiktokenFilePaths = ['node_modules/js-tiktoken/dist/index.cjs', 'node_modules/js-tiktoken/dist/index.js'];

function cleanup() {
  for (const filePath of tavilyFilePaths) {
    if (fs.existsSync(filePath)) {
      // Create a backup
      const backupPath = filePath + '.bak';
      fs.copyFileSync(filePath, backupPath);

      let content = fs.readFileSync(filePath, 'utf-8');
      content = content.replace(
        `var DEFAULT_MODEL_ENCODING = "gpt-3.5-turbo"`,
        'var DEFAULT_MODEL_ENCODING = "gpt-4o"'
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Successfully overrided Tavily SDK's js-tiktoken model name in ${filePath}`);
    }
  }
  for (const filePath of tiktokenFilePaths) {
    if (fs.existsSync(filePath)) {
      // Create a backup
      const backupPath = filePath + '.bak';
      fs.copyFileSync(filePath, backupPath);

      let content = fs.readFileSync(filePath, 'utf-8');

      // Clear all encodings except for o200k_base
      const patterns = [
        ['gpt2_default', 'var gpt2_default = { "explicit_n_vocab": 50257, "pat_str":', 'var gpt2_default = {}'],
        ['p50k_base_default', 'var p50k_base_default = { "explicit_n_vocab":', 'var p50k_base_default = {}'],
        ['p50k_edit_default', 'var p50k_edit_default = { "pat_str":', 'var p50k_edit_default = {}'],
        ['r50k_base_default', 'var r50k_base_default = { "explicit_n_vocab":', 'var r50k_base_default = {}'],
        ['cl100k_base', 'var cl100k_base_default = { "pat_str":', 'var cl100k_base_default = {}'],
      ];

      for (const [name, searchStr, replaceStr] of patterns) {
        const startIdx = content.indexOf(searchStr);
        if (startIdx === -1) continue;

        // Find the end of line
        const endIdx = content.indexOf('\n', startIdx);
        if (endIdx === -1) continue;

        // Replace the line
        content = content.slice(0, startIdx) + replaceStr + content.slice(endIdx);
      }

      // Write back
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Successfully cleaned up js-tiktoken encodings in ${filePath}`);
    }
  }
}

function restore() {
  for (const filePath of tavilyFilePaths) {
    if (fs.existsSync(`${filePath}.bak`)) {
      console.log(`Restoring Tavily SDK's js-tiktoken encodings in ${filePath}`);
      fs.renameSync(`${filePath}.bak`, filePath);
    }
  }

  for (const filePath of tiktokenFilePaths) {
    if (fs.existsSync(`${filePath}.bak`)) {
      console.log(`Restoring js-tiktoken encodings in ${filePath}`);
      fs.renameSync(`${filePath}.bak`, filePath);
    }
  }
}

function build() {
  try {
    let command = 'build'
    if (process.argv.includes('--generate')) {
      command = 'generate'
    }
    cleanup()
    execSync(`pnpm ${command}`, { stdio: 'inherit' })
  } catch (error) {
    console.error(error)
  } finally {
    restore()
  }
}

build()
