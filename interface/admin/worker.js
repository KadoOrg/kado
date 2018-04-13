'use strict';
const K = require('../../index')
const interfaceRoot = __dirname
const interfaceName = 'admin'
let worker = K.iface.worker(K,interfaceName,interfaceRoot)
worker.enableSession(function(app){
  let flash = require('connect-flash')
  let compileFile = require('pug').compileFile
  app.use(flash())
  let viewFn = {}
  app.use(function(req,res,next){
    res.locals.flash = req.flash.bind(req)
    req.flashPug = function(type,view,vars){
      if(type && view){
        if(-1 === Object.keys(viewFn).indexOf(view)){
          viewFn[view] =
            compileFile(app.get('views') + '/_alerts/' + view + '.pug',{})
        }
        return req.flash(type,viewFn[view](('object'===typeof vars)?vars:{}))
      } else if(type){
        return req.flash(type)
      } else {
        return req.flash()
      }
    }
    next()
  })
})
worker.enableHtml(function(app){
  let serveStatic = require('serve-static')
  //setup view engine
  app.set('trust proxy',true)
  app.locals.basedir = interfaceRoot + '/view'
  app.set('views',interfaceRoot + '/view')
  app.set('view engine','pug')
  //static files
  app.use(serveStatic(interfaceRoot + '/public'))
})
worker.setup(function(app){
  //login
  app.post('/login',function(req,res){
    let promises = []
    let authTried = 0
    let invalidLoginError = new Error('Invalid login')
    Object.keys(K.modules).forEach(function(modName){
      if(K.modules.hasOwnProperty(modName)){
        let modConf = K.modules[modName]
        if(modConf.admin && true === modConf.admin.providesAuthentication){
          promises.push(new K.bluebird(function(resolve,reject){
            let mod = require(modConf.root)
            if('function' === typeof mod.authenticate){
              authTried++
              mod.authenticate(
                K,
                req.body.email,
                req.body.password,
                function(err,authValid,sessionValues){
                  if(err){
                    return reject(err)
                  }
                  if(true !== authValid){
                    return reject(invalidLoginError)
                  }
                  let session = new K.ObjectManage(req.session.staff || {})
                  session.$load(sessionValues)
                  req.session.staff = session.$strip()
                  resolve()
                }
              )
            } else {
              reject(invalidLoginError)
            }
          }))
        }
      }
    })
    K.bluebird.all(promises)
      .then(function(){
        if(0 === authTried){
          K.log.warn('No authentication provider modules enabled')
          throw invalidLoginError
        }
        req.flash('success','Login success')
        res.redirect('/')
      })
      .catch(function(err){
        req.flash('error',err.message || 'Invalid login')
        res.redirect('/login')
      })
  })
  app.get('/login',function(req,res){
    res.render('login')
  })
  app.get('/logout',function(req,res){
    req.session.destroy()
    delete res.locals.staff
    res.redirect(301,'/login')
  })
  //auth protection
  app.use(function(req,res,next){
    //private
    if(!req.session.staff && req.url.indexOf('/login') < 0){
      res.redirect('/login')
    } else if(req.session.staff){
      res.locals.staff = req.session.staff
      next()
    } else {
      next()
    }
  })
  //home page
  app.get('/',function(req,res){
    res.render('home')
  })
  //add default navbar entries
  app.nav.addGroup('/','Dashboard','home')
})

if(require.main === module){
  K.infant.worker(
    worker.server,
    K.config.name + ':' + interfaceName + ':worker',
    function(done){
      worker.start(done)
    },
    function(done){
      worker.stop(done)
    }
  )
}
