'use strict'
const fs = require('fs')
const FileSync = require('lowdb/adapters/FileSync')
const lodashId = require('lodash-id')
const low = require('lowdb')

class DB {
  constructor (dbPath, $defaults = {}){
    const adapter = new FileSync(dbPath)
    this.low = low(adapter)
    this.low._.mixin(lodashId)
    this.low.defaults($defaults).write()
  }

  model(collection){
    return new Model(collection, this.low)
  }

  static open(dbPath, $defaults = {}) {
    return new DB(dbPath, $defaults)
  }
}

class Model{
  constructor (collection, _) {
    this._ = _
    this.collection = collection
    this.wheres = {}
  }

  where(key, value = undefined) {
    if (typeof key === 'string' && value !== undefined) {
      this.wheres[key] = value
    }

    if (typeof key === 'object') {
      this.wheres = Object.assign({}, this.wheres, key)
    }

    return this;
  }

  find(id) {
    return this.where('id', id).first()
  }

  create(data){
    let db = this.open()

    return db.insert(data).write()
  }

  updateOrCreate(where, data = {}){
    if (this.where(where).first()) {

    }
  }

  all(){
    let db = this.open()

    if (JSON.stringify(this.wheres) === '{}') {
      return db.value()
    }

    return db.find(this.wheres).value()
  }

  get(){
    return this.all()
  }

  first(){

    let all = this.all()


    return all[0]
  }

  open(){
    return this._.get(this.collection)
  }
}


export default DB;
