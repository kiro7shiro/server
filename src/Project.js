const path = require('path')

class Project {
    constructor(pathname) {
        this.path = pathname
        this.name = path.parse(pathname).base
    }
    get app() {
        return require(`${this.path}/index.js`)
    }
}

module.exports = { Project }
