const fs = require('fs')
const path = require('path')

const zh = path.join(__dirname, './zh/faq/faq.md')
const en = path.join(__dirname, './en/faq/faq.md')
const dict = {
  zh,
  en
}

// 开始处理
async function start(lang = 'zh') {
  const content = fs.readFileSync(dict[lang]).toString()
  const list = []
  const item = {
    title: '',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
    viewCount: 0, // 浏览
    upCount: 0, // 点赞
    downCount: 0, // 踩
    category: '', // 分类
    tag: [], // 标签
    author: {
      nickName: '',
      avatarUrl: '',
    },
  }
  const rows = content.split(/## Q[:：]/)
  rows.forEach(row => {
    const title = row.split('\n')[0].trim()
    const content = row.split('\n').slice(1).join('\n').replace(/A[:：]/gim, '').trim()
    list.push({
      title,
      category: '',
      tag: [],
      content,
    })
  })
  fs.writeFileSync(`faq_${lang}.json`, JSON.stringify(list, null, 2))
}
start()
start('en')
