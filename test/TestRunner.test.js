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
const runnerKado = require('../lib/TestRunner').getInstance('Kado')
const { expect } = require('../lib/Validate')
runnerKado.suite('TestRunner',(it_main)=>{
  const indent = ' | '
  const runner = require('../lib/TestRunner').getInstance('Self',indent)
  it_main('should pass self-test',async ()=>{
    const suite1 = runner.suite('suite1')
    const getOne = function(){ return new Promise((resolve)=>{
      setTimeout(()=>{ resolve(1) },2)
    }) }
    runner.before(()=>{ console.log(indent + 'stuff before running tests') })
    suite1.after(()=>{ console.log(indent + ' some stuff after the suite ') })
    runner.after(()=>{ console.log(indent + 'some stuff after the tests') })
    suite1.it('should do stuff',()=>{ expect.eq(true) })
    suite1.it('should do stuff 1',()=>{ expect.eq('true','true') })
    suite1.it('should do stuff 2',async ()=>{ expect.eq(await getOne(),1) })
    suite1.it('should do stuff 3',function(){
      this.timeout(2)
      return new Promise((resolve)=>{ setTimeout(()=>{
        resolve(expect.eq(null,null))
      },10) })
    })
    suite1.it('should do stuff 4',()=>{ expect.eq(false) })
    suite1.it('should do stuff 5',()=>{ throw new Error('foo') })
    //suites should recurse
    const test2 = suite1.suite('something nested')
    test2.it('should do more stuff',()=>{ expect.eq() })
    //and again
    const test3 = test2.suite('something really deep')
    test3.it('that is what she said',()=>{ expect.eq() })
    runner.test('something out of band',()=>{ expect.eq(false,false) })
    runner.test('something out of band 2',()=>{ expect.eq(false,true) })
    expect.eq(await runner.execute({indent:indent,hideFailed: true})
      .then(code => {
        expect.eq(code,4)
      })
      .catch((e)=>{
        console.log(indent + `TestRunner testing failed: ${e.message}`)
        process.exit(1)
      }),
    undefined)
  })
})
if(require.main === module) runnerKado.execute().then(code => process.exit(code))
