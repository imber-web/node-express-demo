const express = require('express')
const fs = require('fs')
const app = express()
const multiparty = require('multiparty')
const uploadDir = `${__dirname}/upload`

// 延迟函数
const delay = function delay(interval) {
  typeof interval !== 'number' ? (interval = 1000) : null
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, interval)
  })
}
// 基于multiparty插件实现文件上传处理 & form-data解析
const multiparty_upload = function multiparty_upload(req, auto) {
  typeof auto !== 'boolean' ? (auto = false) : null
  let config = {
    maxFieldsSize: 200 * 1024 * 1024
  }
  if (auto) config.uploadDir = uploadDir
  return new Promise(async (resolve, reject) => {
    await delay()
    new multiparty.Form(config).parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        fields,
        files
      })
    })
  })
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  req.method === 'OPTIONS'
    ? res.send('CURRENT SERVICES SUPPORT CROSS DOMAIN REQUESTS!')
    : next()
})

app.post('/upload_single', async (req, res) => {
  try {
    let { files } = await multiparty_upload(req, true)
    let file = (files.file && files.file[0]) || {}
    res.send({
      code: 0,
      codeText: 'upload success',
      originalFilename: file.originalFilename,
      servicePath: file.path.replace(__dirname, HOSTNAME)
    })
  } catch (err) {
    res.send({
      code: 1,
      codeText: err
    })
  }
})

app.listen(8000, () => {
  console.log('8000端口启动')
})
