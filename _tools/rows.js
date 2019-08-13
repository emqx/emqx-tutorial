const fs = require('fs')
const glob = require('glob')
const path = require('path')

glob('../en/**/**.md', (err, files) => {
  files.forEach((file) => {
    const filePath = path.join(__dirname, file)
    const rows = fs.readFileSync(filePath).toString().split('\n')
    if (rows.length < 3) {
      console.log(rows.join(','), ' ----> ', file.split('en').pop())
      console.log('\n')
    }
  })
})