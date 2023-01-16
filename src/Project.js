const path = require('path')

class Project {
    constructor(pathname) {
        this.path = pathname
        this.name = path.parse(pathname).base
        this.href = `/${this.name}`
    }
    get app() {
        return require(`${this.path}/index.js`).app
    }
}

module.exports = { Project }
