// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')
cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  var url=event.url
  return new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error) {
        reject()
      } else {
        try {
          resolve(body)
        } catch (e) {
          reject()
        }
      }
    })
  })
}