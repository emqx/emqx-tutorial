const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = process.cwd()

const zh_path = path.join(root, './zh')
const en_path = path.join(root, './en')

const main = {
  touch(file, title) {
    const file_array = file.split('/')
    file_array.pop()
    const file_dir = file_array.join('/')
    if (!fs.existsSync(file_dir)) {
      execSync(`mkdir -p ${file_dir}`)
    }
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, `# ${title}`)
      console.log(title, 'Done')
    } else {
      console.log(title, '已存在')
    }
  },
  init(dir) {
    const summary = path.join(dir, './SUMMARY.md')

    let rows = fs.readFileSync(summary).toString().split('\n')

    for (let row of rows) {
      if (!row.replace(/\s/g, '').startsWith('*')) {
        continue
      }
      row = row.match(/\[(.+)]\((.+)\)/g)[0]
      if (!row) {
        continue
      }
      row = row.split('](')
      const title = row[0].replace(/[\[\]\(\)]/g, '')
      let file = row[1].replace(/[\[\]\(\)]/g, '')
      file = path.join(dir, file)

      this.touch(file, title)
    }
  },
}
main.init(zh_path)
main.init(en_path)
