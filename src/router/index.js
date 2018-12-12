'use strict'
import DB from '../db'

class Router {

  constructor(dbPath) {
    this.db = new DB(dbPath, {
      domainStrategy: 'IPOnDemand',
      rules:[]
    })
  }
}
