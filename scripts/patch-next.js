const fs = require('fs');
const path = require('path');

// Patch 1: Fix generateBuildId issue
const buildIdPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'generate-build-id.js');

if (fs.existsSync(buildIdPath)) {
  let content = fs.readFileSync(buildIdPath, 'utf8');

  if (!content.includes('typeof generate === "function"')) {
    content = content.replace(
      'let buildId = await generate();',
      'let buildId = typeof generate === "function" ? await generate() : null;'
    );
    fs.writeFileSync(buildIdPath, content);
    console.log('✓ Patched next/dist/build/generate-build-id.js');
  } else {
    console.log('✓ Already patched generate-build-id.js');
  }
} else {
  console.log('✗ File not found:', buildIdPath);
}

// Patch 2: Create NextResponse shim for Next.js 14 compatibility
const shimPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'server', 'web', 'exports', 'next-response.js');

if (!fs.existsSync(shimPath)) {
  const shimContent = `// Compatibility shim for Next.js 14
module.exports = require('./index').NextResponse;
module.exports.NextResponse = require('./index').NextResponse;
`;
  fs.writeFileSync(shimPath, shimContent);
  console.log('✓ Created next-response.js shim');
} else {
  console.log('✓ next-response.js shim already exists');
}
