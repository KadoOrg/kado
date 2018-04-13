# Kado [![Build Status](https://travis-ci.org/nullivex/kado.svg?branch=master)](https://travis-ci.org/nullivex/kado)

Modular application development framework based on Node.js

## Preface

Take a look at this blog post: https://www.nullivex.com/blog/kado-comeback

## What does it do

Kado provides a simple extensible environment to run
modules that group together to become an application.

This is contrary to the traditional approach of starting with
base code and assets then providing routes on top of that.
Kado aims to compress the duplicated code created during this
process and provide a simpler workflow for developers that
remains consistent regardless of a changing environment.

## Usage

Basic administration panel

```
# mkdir myproject
# cd myproject
# npm install kado --save
# node node_modules/kado/bin/kado bootstrap --app myproject --enable-staff
# node app
```

Simple blog website (equivalent of wordpress)

```
# mkdir myblog
# cd myblog
# npm install kado --save
# node_modules/kado/bin/kado bootstrap --app myblog --enable-all
# node app
```

## Modules

Kado modules drive the entire user space system which comprises
the actionable code.

The plugin format follows a rather loose format to provide
agility with different progamming languages and non web
based programs.

### Example Plugin Structure

```
- kado/myplugin
  - index.js (plugin entry point, called by system)
  - kado.json (kado plugin definition)
```

#### Kado.json

The plugin definition file will tell Kado how to handle the
plugin. This involves chain loading into other programming
languages (which may required a Javascript shim).

**NOTE** This format is under construction.

```json
{
  "enabled": false,
  "name": "myPlugin",
  "admin": {
    "enabled": true,
    "nav": {
      "sequence": 5,
      "name": "My Plugin",
      "uri" : "/myplugin"
    }
  }
}
```

This format is somewhat self explanatory. However in detail:

* `enabled` - Control plugin being loaded at runtime
* `name` - Plugin name when addressed by the system
* `admin` - Object containing admin panel definitions
  * `enabled` - Load this module into the admin panel
  * `nav` - Object containing admin navigation properties
    * `sequence` - Order to display the nav in, conflicts go alphabetical
    * `name` - Name of the plugin to display in the nav bar
    * `uri` - URI to the admin plugin

## Changelog

### 2.0.0
* Remove SQLite, CouchDB, Couchbase connectors
* Implement ES6
* Update to latest dependencies
* Drop `user` module and implement more robust `staff` module for default login
* Implement blog cli
* Implement blog api
* Implement complete e2e testing of the system
* Add uri handing to blog module

### 1.1.1
* Remove database connectors from dependencies they should be installed at
app build time.

### 1.1.0
* Remove couchdb connector
* Remove couchbase connector
* Fix failure on blog main startup

### 1.0.0
* Initial release
