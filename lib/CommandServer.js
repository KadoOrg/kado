'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */

module.exports = class CommandServer {
  static getInstance () { return new CommandServer() }
  constructor () {
    this.version = '0.0.0'
    this.commands = {}
  }

  setVersion (version) {
    this.version = version
    return version
  }

  getCommand (module, name) {
    if (!this.commands[module]) {
      throw new Error(`Module ${module} not found`)
    }
    if (!this.commands[module][name]) {
      throw new Error(`Command ${name} not found in ${module}`)
    }
    return this.commands[module][name]
  }

  removeCommand (module, name) {
    if (!this.commands[module]) return false
    delete this.commands[module][name]
    return name
  }

  all () {
    return this.commands
  }

  command (module, name, options) {
    if (!options) options = {}
    options.name = name
    if (!this.commands[module]) this.commands[module] = {}
    const that = this
    const CommandSuper = require('./Command')
    class Command extends CommandSuper {
      constructor () {
        super()
        this.name = name
        this.options = options
        this.version = that.version
      }

      action (opts) {
        return options.action.call(this, opts)
      }
    }
    this.commands[module][name] = new Command()
    return name
  }

  run (command) {
    // so this is where we would basically parse and run a command artificially
    // but since we dont register all the commands yet like we should this
    // wont quite work right, now this is becoming some sweet api, and i dont
    // think anyone has ever taken this time to really make the cli interface
    // nice thing to use, which in my opinion will help a lot with scripting
    // thought about it some more, so the command line system becomes core
    // sub system which requires all the modules to register their commands with
    // it and then we can introspect and run the commands when needed at which
    // point using this function will be trivial, hold on
    let argv = []
    if (typeof command === 'string') {
      argv = process.argv.slice(0, 2).concat(command.split(' '))
    } else if (command instanceof Array) {
      argv = command
    }
    if (!(argv instanceof Array) || argv.length < 4) {
      throw new Error(`Invalid command ${argv.join(' ')}`)
    }
    return this.getCommand(argv[2], argv[3]).parse(argv)
  }
}
