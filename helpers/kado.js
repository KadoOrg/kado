'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')
const debug = require('debug')('kado:core')
const execSync = require('child_process').execSync
const fs = require('fs')
const glob = require('glob')
const infant = require('infant')
const LineByLine = require('n-readlines')
const moment = require('moment')
const mustache = require('mustache')
const ObjectManage = require('object-manage')
const path = require('path')
const pkg = require('../package.json')

let config = new ObjectManage()
let lifecycle = new infant.Lifecycle()
let logger = require('./logger')


//-----------------
//Begin Overrides
//-----------------

//tell everyone where we are. this trick works because every interface starter
//loads this file first which will be in every process that a module will ever
//load... i suppose if for some reason an interface is created without the use
//of this file it will cause problems.. warning issued!


/**
 * Kado Root Folder
 * @type {String}
 */
process.env.KADO_ROOT = path.dirname(__dirname)


/**
 * Kado User Root Folder
 * @type {string}
 */
process.env.KADO_USER_ROOT = path.dirname(path.dirname(process.env.KADO_ROOT))
if(!fs.existsSync(process.env.KADO_USER_ROOT + '/node_modules/kado')){
  process.env.KADO_USER_ROOT = 0
}


/**
 * Kado Helpers
 * @type {string}
 */
process.env.KADO_HELPERS = path.resolve(process.env.KADO_ROOT + '/helpers')


/**
 * Kado Interfaces
 * @type {string}
 */
process.env.KADO_INTERFACES = path.resolve(process.env.KADO_ROOT + '/interface')


/**
 * Kado Lang Path
 * @type {string}
 */
process.env.KADO_LANG = path.resolve(process.env.KADO_ROOT + '/lang')


/**
 * Kado Plugins Path
 * @type {string}
 */
process.env.KADO_MODULES = path.resolve(process.env.KADO_ROOT + '/kado_modules')


/**
 * Kado User Plugins Path
 * @type {string}
 */
process.env.KADO_USER_MODULES = path.resolve(
  path.dirname(path.dirname(process.env.KADO_ROOT)) + '/kado_modules')


/**
 * Kado User Helpers Path
 * @type {string}
 */
process.env.KADO_USER_HELPERS = path.resolve(
  path.dirname(path.dirname(process.env.KADO_ROOT)) + '/helpers')


/**
 * Kado User Lang Path
 * @type {string}
 */
process.env.KADO_USER_LANG = path.resolve(
  path.dirname(path.dirname(process.env.KADO_ROOT)) + '/lang')


//dist config schema
config.$load({
  dev: null,
  title: 'Kado',
  name: 'kado',
  version: pkg.version,
  log: {
    dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
  },
  //dynamic connectors
  connector: {
    stretchfs: {
      load: false,
      callback: {
        method: 'post',
        url: 'http://localhost:8160/file/jobUpdate',
        rejectUnauthorized: false
      },
      referrer: ['localhost'],
      domain: 'localhost:8162',
      token: 'changeme',
      host: 'localhost',
      port: 8161,
      username: '',
      password: ''
    }
  },
  //database connectors
  db: {
    sequelize: {
      enabled: true,
      load: true,
      skipConnect: false,
      name: 'kado',
      host: '127.0.0.1',
      port: 3306,
      user: '',
      password: '',
      logging: false,
      skipLoggingTable: ['StaffSessions'],
      benchmark: false,
      slowQueryTime: 10000,
      dialect: 'mysql',
      modelInit: null,
      options: {}
    }
  },
  //email connectors
  email: {
    notifyTo: 'Kado <kado@localhost>',
    notifyCc: '',
    replyTo: 'Kado <kado@localhost>',
    defaultFrom: 'Kado <kado@localhost>',
    defaultSubject: 'Email from Kado',
    log:{
      enable: false,
      file: '/var/log/emailinfo'
    },
    emailjs: {
      enabled: false,
      load: true,
      user: 'kado@localhost',
      password: '',
      host: 'localhost',
      port: null,
      ssl: false,
      tls: false,
      timeout: null
    }
  },
  //define interfaces
  interface: {
    admin: {
      enabled: false,
      title: 'Kado Admin',
      pageTitle: 'Kado Admin',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/admin'),
      port: 3000,
      host: null,
      baseUrl: '',
      viewCache: true,
      scriptServer: [],
      staticRoot: [],
      addCss: [],
      removeCss: [],
      addScript: [],
      removeScript: [],
      override: {
        lang: {},
        nav: {},
        permission: {allowed: {}, available: []},
        uri: {},
        view: {}
      },
      workers: {
        count: 1,
        maxConnections: 10000
      },
      cookie: {
        secret: '',
        maxAge: 2592000000 //30 days
      }
    },
    cli: {
      enabled: true,
      title: 'Kado CLI',
      transport: ['tty','system'],
      path: path.resolve(process.env.KADO_INTERFACES + '/bin')
    },
    main: {
      enabled: false,
      title: 'Kado Main',
      pageTitle: 'Kado Main',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/main'),
      port: 3001,
      host: null,
      baseUrl: '',
      viewCache: true,
      scriptServer: [],
      staticRoot: [],
      addCss: [],
      removeCss: [],
      addScript: [],
      removeScript: [],
      override: {
        lang: {},
        nav: {},
        permission: {allowed: {}, available: []},
        uri: {},
        view: {}
      },
      workers: {
        count: 1,
        maxConnections: 10000
      },
      cookie: {
        secret: '',
        maxAge: 2592000000 //30 days
      }
    }
  },
  module: {
    blog: {},
    content: {},
    doc: {},
    kado: {},
    setting: {},
    staff: {}
  }
})

//set dev mode if debug is turned on and the dev option is null
if(null === config.dev &&
  (process.env.NODE_DEBUG === 'kado' || process.env.DEV === 'kado')
){
  process.env.NODE_DEBUG = 'kado'
  config.dev = true
}


/**
 * clone the original config for looking back
 * @type {object}
 */
config.originalConfig = ObjectManage.$clone(config)


/**
 * Interface helper
 */
exports.iface = require('./interface')


/**
 * Base64 helper
 * @type {Object}
 */
exports.base64js = exports.b64 = require('base64-js')


/**
 * Export bluebird for promise support
 * @type {P}
 */
exports.bluebird = P


/**
 * Mustache templating engine
 * @type {Object}
 */
exports.mustache = mustache


/**
 * Export Infant for global usage
 * @type {infant}
 */
exports.infant = infant


/**
 * Determine if an incoming request is JSON
 * @param {object} req
 * @return {bool}
 */
exports.isClientJSON = (req) => {
  let accept = req.get('accept') || ''
  return (req.query.json || accept.match('application/json'))
}


/**
 * Export lifecycle object
 * @type {object}
 */
exports.lifecycle = lifecycle


/**
 * Sequelize datatables helper
 * @type {object}
 */
exports.datatable = require('sequelize-datatable')


/**
 * Remove from model by array of ids
 * @type {object}
 */
exports.modelRemoveById = (Model,items) => {
  const validator = require('validator')
  return P.try(() => {
    if(!(items instanceof Array))
      throw new Error('Invalid data passed for record removal')
    let promises = []
    let i = items.length - 1
    for(; i >= 0; i--){
      if(validator.isNumeric('' + items[i])){
        promises.push(Model.destroy({where: {id: items[i]}}))
      }
    }
    return P.all(promises)
  })
}


/**
 * Cron class
 * @type {Cron}
 */
exports.Cron = require('./Cron')


/**
 * Event Class
 * @type {Event}
 */
exports.Event = require('./Event')


/**
 * Event instance
 */
exports.event = new exports.Event(exports)


/**
 * Message class
 * @type {Message}
 */
exports.Message = require('./Message')


/**
 * Message instance
 * @type {Message}
 */
exports.message = new exports.Message(exports)


/**
 * Export ObjectManage object
 * @type {Object}
 */
exports.ObjectManage = ObjectManage


/**
 * Export ObjectManage object
 * @type {Object}
 */
exports.Permission = require('./Permission')


/**
 * Export ObjectManage object
 * @type {Object}
 */
exports.URI = require('./URI')


/**
 * Export ObjectManage object
 * @type {Object}
 */
exports.View = require('./View')


/**
 * Filesystem helper from Node core
 * @type {Object}
 */
exports.fs = fs


/**
 * Assign config to global
 * @type {ObjectManage}
 */
exports.config = config


/**
 * Load new configuration
 * @param {object} conf
 * @return {ObjectManage}
 */
exports.configure = (conf) => {
  exports.config.$load(conf)
  return exports.config
}


/**
 * Get application root
 * @return {string}
 */
exports.root = () => {
  return path.resolve(config.root || path.dirname(__dirname))
}


/**
 * Get the kado folder
 * @return {string}
 */
exports.dir = () => {
  return path.resolve(path.dirname(__dirname))
}


/**
 * Get a kado path
 * @param {string} part
 * @return {string}
 */
exports.kadoPath = (part) => {
  if(part) return path.resolve(exports.dir() + '/' + part)
  else return exports.dir()
}


/**
 * Shortcut to node.path
 * @type {module:path}
 */
exports.path = require('path')


/**
 * Shortcut to get a helper location.
 * @param name
 * @returns {string}
 */
exports.helper = (name) => {
  if(!name) throw new Error('Helper required without a name')
  let userHelper = path.resolve(process.env.KADO_USER_HELPERS +
    '/' + name + '.js')
  let kadoHelper = path.resolve(process.env.KADO_HELPERS +
    '/' + name + '.js')
  if(!fs.existsSync(userHelper) && fs.existsSync(kadoHelper)) return kadoHelper
  return userHelper
}


/**
 * Sync tail file
 * @param {string} path
 * @return {string}
 */
exports.tailFile = (path) => {
  let log = ''
  if(fs.existsSync(path)){
    let fd = new LineByLine(path)
    let line, lines = []
    while((line = fd.next())) lines.push(line)
    let start = lines.length - 20
    if(start < 0) start = 0
    log = lines.splice(start,lines.length-1).join('\n')
  }
  return log
}


/**
 * Append file with data
 * @param {string} path
 * @param {string} data
 * @return {string}
 */
exports.appendFile = (path,data) => {
  fs.appendFileSync(path,data)
  return data
}


/**
 * Print date with a nice format
 * @param {Date} d
 * @param {string} emptyString
 * @return {string}
 */
exports.printDate = (d,emptyString) => {
  if(d === undefined || d === null) d = new Date()
  emptyString = ('string' === typeof emptyString) ? emptyString : 'Never'
  if(!(d instanceof Date)) d = new Date(d)
  return d ? moment(d).format('YYYY-MM-DD hh:mm:ssA') : emptyString
}


/**
 * Execute a command sync and return the appropriate log
 * @param {string} cmd
 * @param {object} opts
 * @return {string} output
 */
exports.execSync = (cmd,opts) => {
  let out = exports.printDate(new Date()) + ' [INFO]: ' + cmd + '\n'
  try {
    out = out + execSync(cmd,opts)
  } catch(e){
    out = out + exports.printDate(new Date()) + ' [ERROR]: ' + e.message
  }
  return out
}


/**
 * Update plugin path to staff modules
 * @param {string} p
 * @return {string}
 */
exports.modulePath = (p) => {
  process.env.KADO_USER_MODULES = path.resolve(p)
  return process.env.KADO_USER_MODULES
}


/**
 * Send Mail
 *  {
 *    from: 'Foo <foo@example.com>',
 *    to: 'Foo <foo@example.com>',
 *    subject: 'Foo Foo',
 *    message: 'Foo bar baz',
 *    html: '<b>Foo</b>',
 *    attachment: '/foo.jpg' || streamFoo || 'foo attachment message'
 *  }
 * @param {object} options
 */
exports.sendMail = (options) => {
  let handlers = []
  //select active email handlers
  Object.keys(exports.email).map((key) => {
    let mailConf = exports.config.email[key]
    if(!mailConf.enabled) return
    handlers.push(key)
  })
  //notify the console if there are no handlers active
  if(!handlers.length){
    exports.log.warn('No mail handlers active to send',options)
    return
  }
  //use all active connectors to send with
  return exports.bluebird.try(()=>{return handlers}).map((key)=>{
    if(!exports.email[key] || 'function' !== typeof exports.email[key].send){
      return
    }
    return exports.email[key].send(exports,options)
  })
}


/**
 * Dynamic Connectors
 * @type {object}
 */
exports.connector = {}


/**
 * Store database connectors
 * @type {object}
 */
exports.db = {}


/**
 * Store email connectors
 */
exports.email = {}


/**
 * Store registered interfaces
 * @type {object}
 */
exports.interfaces = {}


/**
 * Store registered modules
 * @type {object}
 */
exports.modules = {}


/**
 * Language pack structures
 * @type {*|ObjectManage}
 */
exports.lang = require('./lang')


/**
 * Search system
 * @param {string} app
 * @param {string} phrase
 * @type {function}
 */
exports.search = (app,phrase) =>{
  return require('./search')(exports,app,phrase)
}


/**
 * Initiate logger and then load over it with context
 * @type {winston.Logger}
 */
exports.log = logger.setupLogger()


/**
 * Init status flag
 * @type {boolean}
 */
exports.initComplete = false

let doScan = (pattern,handler) => {
  return new P((resolve) => {
    glob(pattern,(err,files) => {
      files.map(handler)
      resolve()
    })
  })
}


/**
 * Scan for modules and populate Kado object
 * @return {P}
 */
exports.scanModules = () => {
  //load environmental config
  exports.loadEnvConfig()
  let sysGlob = process.env.KADO_MODULES + '/**/kado.js'
  let userGlob = process.env.KADO_USER_MODULES + '/**/kado.js'
  let loadModule = (file) => {
    let module = new ObjectManage(require(file)._kado)
    module.root = path.dirname(file)
    if(exports.config.module[module.name]){
      module.$load(exports.config.module[module.name])
    }
    if(module.enabled){
      if(exports.modules[module.name]){
        exports.log.debug('WARN: Duplicate module registration attempted ' +
          module.name)
      } else {
        exports.modules[module.name] = module.$strip()
      }
    }
  }
  //scan system modules
  debug('Scanning system modules')
  return doScan(sysGlob,loadModule)
    .then(() => {
      //scan extra modules
      debug('Scanning extra modules')
      return doScan(userGlob,loadModule)
    })
    .then(() => {
      debug('Found ' + Object.keys(exports.modules).length + ' module(s)')
    })
}


/**
 * Support loading config from environment variable one time
 * @type {boolean}
 */
let envConfigLoaded = false


/**
 * Load environment config if not loaded already
 */
exports.loadEnvConfig = () => {
  //load any config left in the env for us
  if(!envConfigLoaded && process.env.KADO_CONFIG_STRING){
    try {
      let configDelta = JSON.parse(process.env.KADO_CONFIG_STRING)
      debug('Adding found environment config')
      config.$load(configDelta)
      envConfigLoaded = true
    } catch(e){
      exports.log.warn('Failed to load env config: ' + e.message)
    }
  }
}


/**
 * Use development environment variables when not in production
 */
const setupEnv = ()  =>  {
  let prodEnvFile = exports.path.resolve('./.env')
  let prodEnvFileUser = exports.path.resolve(
    process.env.KADO_USER_ROOT + '/.env'
  )
  let devEnvFile = exports.path.resolve('./.env_dev')
  let devEnvFileUser = exports.path.resolve(
    process.env.KADO_USER_ROOT + '/.env_dev'
  )
  if(fs.existsSync(prodEnvFileUser)) prodEnvFile = prodEnvFileUser
  if(fs.existsSync(devEnvFileUser)) devEnvFile = devEnvFileUser
  let dotEnvOpts = {path: prodEnvFile}
  if('dev' === process.argv[2]){
    //strip the dev word so normal kado commands come after
    if('dev' === process.argv[2]) process.argv.splice(2,1)
    dotEnvOpts.path = devEnvFile
    //force dev mode one
    process.env.DEV = 'kado'
    process.env.NODE_DEBUG = 'kado'
    exports.config.dev = true
  }
  require('dotenv').config(dotEnvOpts)
}


/**
 * Automatically bundle resources when needed
 */
const autoBundle = () => {
  if(process.argv.indexOf('--skipBundle') >= 0){
    process.argv.splice(process.argv.indexOf('--skipBundle'),1)
    //bundling for disabled, skip it
    return
  }
  if(process.argv.indexOf('bundle') >= 0){
    //already bundling, dont loop
    return
  }
  if('kado' !== process.env.DEV || 'false' === process.env.BUNDLE){
    //not in dev mode, no auto bundling
    return
  }
  let startTime = new Date()
  exports.log.debug('Starting auto bundling of front end resources')
  let bundleAppFile = exports.path.resolve(process.env.KADO_ROOT + '/.app.js')
  let result = execSync(
    'node ' + bundleAppFile + ' kado bundle -l'
  ).toString('utf-8')
  if(result.indexOf('Bundle process complete') < 0){
    exports.log.error('Auto bundling failed: ' + result)
    process.exit(1)
  } else {
    let duration = +new Date() - (+startTime)
    exports.log.info('Auto bundle complete in ' + duration + 'ms')
  }
}


/**
 * Init, scan modules and interfaces
 * @return {P}
 */
exports.init = (skipDb) => {
  //load environmental config
  exports.loadEnvConfig()
  //override logger with runtime logger
  exports.log = logger.setupLogger(
    process.pid + '-' + config.name,
    config.log.dateFormat
  )
  //setup lifecycle logging
  lifecycle.on('start',(item) => {
    exports.log.info('Starting ' + item.title)
  })
  lifecycle.on('stop',(item) => {
    exports.log.info('Stopping ' + item.title)
  })
  lifecycle.on('online',() => {
    exports.log.info('Startup complete')
  })
  lifecycle.on('offline',() => {
    exports.log.info('Shutdown complete')
  })
  debug('Beginning startup')
  let loadDbConnector = (file) => {
    let name = path.basename(file,'.js')
    //check if the connector is registered and enabled
    if(config.db[name] && config.db[name].load){
      debug(name + ' database connector loaded')
      if(!config.db[name].options) config.db[name].options = {}
      exports.db[name] = require(file)(config.db[name].options)
    }
  }
  let loadEmailConnector = (file) => {
    let name = path.basename(file,'.js')
    //check if the connector is registered and enabled
    if(config.email[name] && config.email[name].load){
      debug(name + ' email connector loaded')
      exports.email[name] = require(file)
    }
  }
  let loadConnector = (file) => {
    let name = path.basename(file,'.js')
    //check if the connector is registered and enabled
    if(config.connector[name] && config.connector[name].load){
      debug(name + ' connector loaded')
      exports.connector[name] = require(file)
      if('function' === typeof exports.connector[name].doConnect){
        debug(name + ' activating connector')
        exports.connector[name].doConnect()
      }
    }
  }
  let connectorGlob = process.env.KADO_ROOT + '/connector/*.js'
  let connectorGlobUser = process.env.KADO_USER_ROOT + '/connector/*.js'
  let dbGlob = process.env.KADO_ROOT + '/db/*.js'
  let dbGlobUser = process.env.KADO_USER_ROOT + '/db/*.js'
  let emailGlob = process.env.KADO_ROOT + '/email/*.js'
  let emailGlobUser = process.env.KADO_USER_ROOT + '/email/*.js'
  return new P((resolve) => {
    //scan db connectors
    debug('Scanning modules')
    exports.scanModules()
      .then(() => {
        debug('Scanning for system email connectors')
        return doScan(emailGlob,loadEmailConnector)
      })
      .then(() => {
        debug('Scanning for user email connectors')
        return doScan(emailGlobUser,loadEmailConnector)
      })
      .then(() => {
        debug('Scanning for system dynamic connectors')
        return doScan(connectorGlob,loadConnector)
      })
      .then(() => {
        debug('Scanning for user dynamic connectors')
        return doScan(connectorGlobUser,loadConnector)
      })
      .then(() => {
        debug('Scanning for system database connectors')
        return doScan(dbGlob,loadDbConnector)
      })
      .then(() => {
        debug('Scanning for user database connectors')
        return doScan(dbGlobUser,loadDbConnector)
      })
      .then(() => {
        debug('Setting up data storage access')
        Object.keys(exports.modules).map((modKey) => {
          if(exports.modules.hasOwnProperty(modKey)){
            let modConf = exports.modules[modKey]
            //enable the kado module regardless of configuration
            if('kado' === modConf.name) modConf.enabled = true
            if(true === modConf.enabled){
              let modFile = modConf.root + '/kado.js'
              let mod = require(modFile)
              if('function' === typeof mod.db){
                mod.db(exports,exports.db,exports.db.sequelize)
              }
            }
          }
        })
        let dbEnabled = 0
        Object.keys(exports.db).map((dbKey) => {
          if(exports.db.hasOwnProperty(dbKey)){
            if(config.db[dbKey].enabled){
              debug(dbKey + ' connector enabled')
              dbEnabled++
            }
          }
        })
        debug('Found ' + dbEnabled + ' database connectors')
        if(!skipDb){
          debug('Connecting to found database connectors')
          let dbConnected = 0
          Object.keys(exports.db).map((dbKey) => {
            if(exports.db.hasOwnProperty(dbKey)){
              if(config.db[dbKey].enabled){
                if('function' === typeof exports.db[dbKey].doConnect){
                  exports.db[dbKey].doConnect({sync: false})
                  debug(dbKey + ' connector connected')
                  dbConnected++
                }
              }
            }
          })
          debug(dbConnected + ' connected database connectors')
        }
        if(false === envConfigLoaded){
          /**
           * Setup Cron handler
           *   only set this helper up when Kado is in the master process
           *   this prevents modules from scheduling cron jobs where they
           *   wont be ran
           * @type {Cron}
           */
          exports.cron = new exports.Cron(exports)
          debug('Scanning for cron jobs from modules')
          let cronModuleCount = 0
          Object.keys(exports.modules).map((modKey) => {
            if(exports.modules.hasOwnProperty(modKey)){
              let modConf = exports.modules[modKey]
              if(true === modConf.enabled){
                let modFile = modConf.root + '/kado.js'
                let mod = require(modFile)
                if('function' === typeof mod.cron){
                  cronModuleCount++
                  mod.cron(exports,exports.cron)
                }
              }
            }
          })
          debug('Cron job scan complete ' + cronModuleCount +
            ' modules(s) and ' + exports.cron.count() + ' job(s) registered')
        }
        debug('Scanning interfaces')
        //register interfaces for startup
        let addInterface = (name) => {
          let env = process.env
          let iface = config.interface[name].path
          env.KADO_CONFIG_STRING = JSON.stringify(config.$strip())
          exports.interfaces[name] = infant.parent(iface,{fork: {env: env}})
          exports.interfaces[name].root = iface
          lifecycle.add(
            name,
            (done) => {
              exports.interfaces[name].start(done)
            },
            (done) => {
              exports.interfaces[name].stop(done)
            }
          )
        }
        Object.keys(config.interface).map((name) => {
          //web panel
          if(
            true === config.$get(['interface',name,'enabled']) &&
            config.$exists(['interface',name,'transport']) &&
            -1 < config.$get(['interface',name,'transport']).indexOf('http')
          )
          {
            //let iface =
            addInterface(name)
          }
        })
        debug('Found ' + Object.keys(exports.interfaces).length +
          ' interface(s)')
        exports.initComplete = true
        debug('Init complete')
        resolve()
      })
  })
}


/**
 * CLI Access to modules
 * @param {Array} args
 * @param {boolean} skipDb skip connection to databases
 */
exports.cli = (args,skipDb) => {
  let K = exports
  K.init(skipDb)
    .then(() => {
      let moduleName = args[2]
      let module = false
      args.splice(2,1)
      process.argv = args
      Object.keys(K.modules).map((m) => {
        if(!module && K.modules[m].name === moduleName) module = K.modules[m]
      })
      if(!module){
        throw new Error('Invalid CLI call, no module found: ' + moduleName)
      }
      require(module.root + '/kado.js').cli(exports,args)
    })
    .catch((err) => {
      K.log.error(err.message)
      process.exit()
    })
}


/**
 * Testing system
 * @param {string} filter passed to --fgrep
 */
exports.test = (filter) => {
  const spawn = require('child_process').spawn
  exports.log.info('Welcome to Test Mode')
  let env = process.env
  env.KADO_TEST = 'kado'
  env.KADO_CONFIG_STRING = JSON.stringify(config.$strip())
  let args = [
    './node_modules/mocha/bin/mocha',
    '-c',
    '--exit',
    '--delay'
  ]
  if(filter){
    args.push('--fgrep')
    args.push(filter)
  }
  process.argv.forEach((v,i) => {
    if(i<4) return
    args.push(v)
  })
  args.push(process.env.KADO_ROOT + '/test/kado.test.js')
  let opts = {
    env: env,
    shell: true
  }
  let t = spawn('node',args,opts)
  t.stdout.on('data',(d) => {
    process.stdout.write(d.toString())
  })
  t.stderr.on('data',(d) => {
    process.stderr.write(d.toString())
  })
  t.on('close',(code)=>{
    if(code > 0){
      exports.log.warn('Testing has failed')
    } else {
      exports.log.info('Testing complete')
    }
  })
}


/**
 * Start master
 * @param {function} done
 */
exports.start = (done) => {
  if(!done) done = () => {}
  exports.init()
    .then(() => {
      lifecycle.start((err) => {
        if(err) throw err
        //auto bundle
        autoBundle()
        done()
      })
    })
}


/**
 * Stop master
 * @param {function} done
 */
exports.stop = (done) => {
  return new P((resolve) => {
    if(!done) done = () => {}
    //start the shutdown process
    console.log('') //on purpose!
    exports.log.info('Beginning shutdown')
    lifecycle.stop((err) => {
      if(err) throw err
      done()
      resolve()
    })
  })

}


/**
 * Rapidly start Kado
 * @param {string} name - name of app
 */
exports.go = (name) => {
  //load environment variables
  setupEnv()
  //go
  return new P((resolve) => {
    if(process.argv.length <= 2){
      exports.infant.child(
        name,
        (done) => {
          exports.start((err) => {
            if(err) return done(err)
            exports.log.info(name.toUpperCase() + ' started!')
            done()
            resolve()

          })
        },
        (done) => {
          exports.stop((err) => {
            if(err) return done(err)
            exports.log.info(name.toUpperCase() + ' stopped!')
            done()
          })
        }
      )
    } else if('test' === process.argv[2]){
      exports.test(process.argv[3])
      resolve()
    } else {
      debug('CLI Mode')
      let skipDb = false
      if('cli' === name) skipDb = true
      exports.cli(process.argv,skipDb)
      resolve()
    }
  })
}
