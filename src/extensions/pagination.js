const { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } = require('../constants/index')

module.exports = class Pagination {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  paginating() {
    const page = this.queryString.page * 1 || DEFAULT_PAGE_INDEX
    const limit = this.queryString.limit * 1 || DEFAULT_PAGE_SIZE
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}
