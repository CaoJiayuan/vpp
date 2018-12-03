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

  get(collection) {
    return this.low.get(collection);
  }

  set(key, value){
    return this.low.set(key, value).write();
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

    if (typeof key === 'function') {
      this.wheres = key
    }

    return this;
  }

  find(id) {
    return this.where('id', id).first()
  }

  create(data){
    let db = this.open()

    delete data['id']
    return db.insert(data).write()
  }

  update(data){
    let db = this.open()

    delete data['id']
    return db.find(this.wheres).assign(data).write()
  }

  updateOrCreate(where, data = {}){
    let exists = this.where(where).first()

    if (exists) {
      return new Model(this.collection, this._).where(where)
        .update(data)
    }
    return this.create(Object.assign({}, where, data))
  }

  all(){
    let db = this.open()

    if (JSON.stringify(this.wheres) === '{}') {
      return db.value()
    }

    return db.filter(this.wheres).value()
  }

  get(){
    return this.all()
  }

  value(){
    return this.all()
  }

  first(){
    let all = this.all()
    if (all && all.length > 0) {
      return all[0]
    }

    return undefined
  }

  open(){
    return this._.get(this.collection)
  }
}


export default DB;
