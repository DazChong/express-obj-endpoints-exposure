const isNoise = function(path) { // cannot use `String.prototype.startsWith` due to min Node.js 6.17.0
  return (
    path.indexOf('/sys/') === 0 || // swagger
    path.indexOf('/mbaas/') === 0 ||
    path.indexOf('/api-docs.json') === 0 ||
    path.indexOf('/print-endpoints') === 0 ||
    path.indexOf('/api-test') === 0
  )
}

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

      // START: appDynamics support
      } else if(r.handle.__appdynamicsProxyInfo__) { 
        const adr = r.handle.__appdynamicsProxyInfo__
        const path = String(adr.obj.regexp).split('\\')[1]
        if(adr.orig.stack) {
          output.push({path: path, nested: getStack(adr.orig.stack)})
        } else if(r.handle.__appdOriginal) { // AppDynamics v4.5.13
          const adr2 = r.handle.__appdOriginal
          if(adr2.stack) {
            output.push({path: path, nested: getStack(adr2.stack)})
          }
        }
      }
      // END: appDynamics support

    })
    return output
  }

  return getStack(app._router.stack)
}

const printEndpoints = function(app, html = true) {
  const endpoints = getEndpoints(app)

  let outputMain = []
  let outoutNoise = []

  function getLine(endpoints, parent = '') {
    endpoints.forEach(e => {
      if(e.nested) {
        getLine(e.nested, e.path)
      } else {
        let methods = Object.keys(e.methods).join(' ').toUpperCase()
        if(methods.length === 3) methods = ' ' + methods // just to pretty align GET
        const path = parent + e.path
        const midwares = e.middlewares.join().toUpperCase()
        const line = methods + ' | ' + path + ' | ' + midwares

        if(isNoise(path)) {
          outoutNoise.push(line)
        } else {
          outputMain.push(line)
        }

      }
    })
  }
  getLine(endpoints)

  output = ['### APP ###'].concat(outputMain).concat(['','### OTHERS ###']).concat(outoutNoise).join('\n')
  
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
