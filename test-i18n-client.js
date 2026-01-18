#!/usr/bin/env node

/**
 * Test i18n loading in client
 */

import SupermemoryClient from './src/supermemory-client.js';

const client = new SupermemoryClient();

console.log('🌍 **Testing i18n in Client**\n');

console.log('Client formatUserContent result:');
const testResult = client.formatUserContent('test content', 'Chris');
console.log(`"${testResult}"`);

console.log('\nExpected in English: "User Chris has saved: test content"');
console.log('If it shows Spanish, there\'s an i18n loading issue.');