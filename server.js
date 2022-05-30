const express = require('express')
const fs = require('fs')
const app = express()
const PORT = 8888
const HOST = 'http://127.0.0.1'
const HOSTNAME = `${HOST}:${PORT}`
// https://github.com/pillarjs/multiparty
const multiparty = require('multiparty')
const uploadDir = `${__dirname}/upload` //upload文件夹的绝对路径

//
app.use(express.static('./'))
// 第一步中间件解决跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  req.method === 'OPTIONS'
    ? res.send('CURRENT SERVICES SUPPORT CROSS DOMAIN REQUESTS!')
    : next()
})

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
    // 限制所有字段（不是文件）可以分配的内存量
    maxFieldsSize: 200 * 1024 * 1024 //默认是2mb
  }
  // 用于放置文件上传的目录
  if (auto) config.uploadDir = uploadDir
  return new Promise(async (resolve, reject) => {
    await delay()
    new multiparty.Form(config).parse(req, (err, fields, files) => {
      console.log(fields, files)
      // fields 文件名{filename:['']}
      // files 文件{[{}]}
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

app.post('/upload_single', async (req, res) => {
  try {
    // 解析formdata拿到files {[{}]}
    let { files } = await multiparty_upload(req, true)
    // 有的话取第零项，拿到file {}
    let file = (files.file && files.file[0]) || {}
    // 放回
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

app.listen(PORT, () => {
  console.log('8000端口启动')
})
