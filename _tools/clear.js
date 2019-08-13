const fs = require('fs')
const path = require('path')

const entry = path.join(process.cwd(), './_book')

const clear = ['.gitignore', 'package.json', 'README.md', 'yarn.lock', 'SUMMARY.md']

for (const link of clear) {
  fs.unlinkSync(path.join(entry, link))
}

console.log('Clear Done')
