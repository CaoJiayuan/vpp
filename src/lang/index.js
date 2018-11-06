import zh_CN from './zh_CN'
const sprintf = require('sprintf')
let locale = 'zh_CN'


export const languages = {
  zh_CN : {
    name : '简体中文',
    lang : zh_CN
  }
}

export function setLocale(l) {
  locale = l
}

export function lang(key, ...args) {
  let v = languages[locale].lang[key]
  return sprintf(v || key, ...args)
}