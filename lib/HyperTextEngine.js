'use strict';
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

module.exports = class HyperTextEngine {
  constructor(){
    this.http = null //engine instance
  }
  checkPort(port){
    if(port === typeof 'string') port = parseInt(port,10)
    if(!('' + port).match(/^\d+$/)) throw new Error(`Invalid port ${port}`)
    if(port > 65536 || port < 0) throw new Error(`Port ${port} out of range`)
  }
  checkHost(host){
    if(typeof host !== 'string' && host !== null){
      throw new Error(`Invalid host type ${typeof host}`)
    }
  }
  checkHttp(){
    if(!this.http) throw new Error('No HTTP instance available')
  }
  start(){
    this.checkHttp()
  }
  stop(){
    this.checkHttp()
  }
}