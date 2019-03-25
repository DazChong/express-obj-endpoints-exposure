# express-obj-endpoints-exposure

Exposing express.js endpoints(including nested) & detect middleware-names.

### 🌈 ZERO dependencies 🌈

## Installation

`npm i https://DazChong@github.com/DazChong/express-obj-endpoints-exposure.git --save`

## Usage

Paste the code below right BEFORE express.js `listen()` function:

```
const { printEndpoints, apiTest } = require('express-obj-endpoints-exposure')
app.get('/print-endpoints', (req, res) => res.send(printEndpoints(app)))
app.get('/api-test', (req, res) => res.json(apiTest(app)))
```



#### Example

```
const express = require('express')
const app = express()
const port = 3000
const birds = require('./birds')

app.get('/', (req, res) => res.send('Home'))
app.get('/oh', (req, res) => res.send('Yes'))
app.use('/birds', birds)



const { printEndpoints, apiTest } = require('express-obj-endpoints-exposure')
app.get('/print-endpoints', (req, res) => res.send(printEndpoints(app)))
app.get('/api-test', (req, res) => res.json(apiTest(app)))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

```

## Sample output (not from Example above)

`printEndpoints()`

```
### APP ###
 GET | /home | 
 GET | /some-path/products | PROTECT
 GET | /some-path/users | PROTECT
POST | /some-path/login

### OTHERS ###
 GET | /api-docs.json | 
 GET | /sys/info | 
 GET | /print-endpoints | 
 GET | /api-test | 
```

`api-test()`
```
{
  "api": [
    {"method": "GET", "path": "\/home", "middlewares": []},
    {"method": "GET", "path": "\/some-path\/products", "middlewares": ["protect"]},
    {"method": "GET", "path": "\/some-path\/users", "middlewares": ["protect"]},
    {"method": "POST", "path": "\/some-path\/login", "middlewares": []}
  ],
  "platform": [
    {"method": "GET", "path": "\/api-docs.json", "middlewares": []},
    {"method": "GET", "path": "\/sys\/info", "middlewares": []},
    {"method": "GET", "path": "\/print-endpoints", "middlewares": []},
    {"method": "GET", "path": "\/api-test", "middlewares": []}
  ]
}
```