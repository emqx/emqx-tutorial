const fs = require('fs')
const path = require('path')

const icon = path.resolve(__dirname, './favicon.ico')
const replaceIcon = path.resolve(__dirname, '../_book/gitbook/images/favicon.ico')

fs.createReadStream(icon).pipe(fs.createWriteStream(replaceIcon))
