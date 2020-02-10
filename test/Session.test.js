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
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Session = require('../lib/Session')
const session = new Session('test', new Session.SessionStoreMemory())
runner.suite('Session', (it) => {
  it('should instantiate', () => {
    const inst = new Session('foo', new Session.SessionStoreMemory())
    Assert.isType('Session', inst)
  })
  it('should restore by sid', async () => {
    const rv = await session.restore()
    Assert.isType('Object', rv)
    Assert.eq(Object.keys(rv).length, 0)
  })
  it('should set and get a key', () => {
    Assert.isType('Session', session.set('foo', 'bar'))
    Assert.eq(session.get('foo'), 'bar')
  })
  it('should save the data to the store', async () => {
    const rv = await session.save()
    Assert.isType('SessionStoreMemory', rv)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
