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

describe('Mapper',()=>{
  const { expect } = require('../lib/Validate')
  const Mapper = require('../lib/Mapper')
  const mapper = new Mapper()
  it('should construct',()=>{
    expect.isType('Mapper',new Mapper())
  })
  it('should set a value with a string',()=>{
    expect.eq(mapper.set('foo1','bar'),'bar')
  })
  it('should set a value with an array',()=>{
    expect.eq(mapper.set(['foo2'],'bar'),'bar')
  })
  it('should set deep value with an array',()=>{
    expect.eq(mapper.set(['foo3','bar'],'baz'),'baz')
  })
  it('should set deep value with a string',()=>{
    expect.eq(mapper.set('foo4.bar.baz.boo','bap'),'bap')
  })
  it('should get a value with a string',()=>{
    expect.eq(mapper.get('foo1'),'bar')
  })
  it('should get a value with an array',()=>{
    expect.eq(mapper.get(['foo2']),'bar')
  })
  it('should get a deep value with an array',()=>{
    expect.eq(mapper.get(['foo3','bar']),'baz')
  })
  it('should get a deep value with a string',()=>{
    expect.eq(mapper.get('foo4.bar.baz.boo'),'bap')
  })
  it('should delete a value with a string',()=>{
    expect.eq(mapper.delete('foo1'),'foo1')
  })
  it('should delete a value with an array',()=>{
    expect.eq(mapper.delete(['foo2']),'foo2')
  })
  it('should delete a deep value with an array',()=>{
    expect.eq(mapper.delete(['foo3','bar']),'bar')
  })
  it('should set a value',()=>{
    expect.eq(mapper.set('foo1','bap'),'bap')
  })
  it('should list all values',()=>{
    expect.eq(mapper.all().foo1,'bap')
  })
  it('should merge an object in',()=>{
    expect.eq(mapper.merge({foo5: 'bar'}).foo5,'bar')
  })
  it('should merge in a 2 level object',()=>{
    expect.eq(mapper.merge({foo6: {foo7: 'bar'}}).foo6.foo7,'bar')
  })
  it('should merge into the 2 level object',()=>{
    expect.eq(mapper.merge({foo6: {foo8: 'bar'}}).foo6.foo8,'bar')
    expect.eq(mapper.foo6.foo7,'bar')
  })
  it('should merge a 3rd level into the 2nd',()=>{
    expect.isType('Mapper',
      mapper.merge({foo6: {foo9: {foo10: {pies: ['apple']}}}}))
    expect.isType('Array',mapper.foo6.foo9.foo10.pies)
  })
})