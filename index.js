const getEndpoints = function(app) {
  if(!app || !app._router || !app._router.stack) {
    console.log(new Date(), ' getEndpoints(app) > app object ERROR')
    return []
  }

  function getStack(stack) {
    let output = []
    stack.forEach(r => {
      if(r.route) {
        const mids = r.route.stack.filter(s => s.name !== '<anonymous>').map(m => m.name)
        output.push({path: r.route.path, methods: r.route.methods, middlewares: mids})
      } else if(r.handle.stack) {
        const path = String(r.regexp).split('\\')[1]
        output.push({path: path, nested: getStack(r.handle.stack)})
      }
    })
    return output
  }

  return getStack(app._router.stack)
}

const printEndpoints = function(app, html = true) {
  const endpoints = getEndpoints(app)

  let output = []

  function getLine(endpoints, parent = '') {
    endpoints.forEach(e => {
      if(e.nested) {
        getLine(e.nested, e.path)
      } else {
        const methods = Object.keys(e.methods).join(' ').toUpperCase()
        const path = parent + e.path
        const midwares = e.middlewares.join().toUpperCase()
        const line = methods + ' | ' + path + ' | ' + midwares
        output.push(line)
      }
    })
  }

  getLine(endpoints)

  output = output.join('\n')
  
  if(html) { output = '<pre>' + output + '</pre>'}

  return output
}

const apiTest = function(app) {
  const endpoints = getEndpoints(app)

  let output = []

  function getLine(endpoints, parent = '') {
    endpoints.forEach(e => {
      if(e.nested) {
        getLine(e.nested, e.path)
      } else {
        const path = parent + e.path
        const midwares = e.middlewares
        const methods = Object.keys(e.methods)
        methods.forEach(m => {
          output.push({method: m.toUpperCase(), path: path, middlewares: midwares})
        })
      }
    })
  }

  getLine(endpoints)

  const api = output.filter(l => (l.path.indexOf('/sys/') === -1 && l.path.indexOf('/mbaas/') === -1))
  const platform = output.filter(l => (l.path.indexOf('/sys/') === 0 || l.path.indexOf('/mbaas/') === 0))

  return {api, platform}
}

module.exports = {
  getEndpoints,
  printEndpoints,
  apiTest
}
