const test = require('tape')
const path = require('path')
const TypedFastBitSet = require('typedfastbitset')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const {
  saveTypedArrayFile,
  loadTypedArrayFile,
  savePrefixMapFile,
  loadPrefixMapFile,
  saveBitsetFile,
  loadBitsetFile,
} = require('../files')

const dir = '/tmp/jitdb-save-load'
rimraf.sync(dir)
mkdirp.sync(dir)

test('save and load bitsets', (t) => {
  const idxDir = path.join(dir, 'test-bitsets')
  mkdirp.sync(idxDir)
  const filename = path.join(idxDir, 'test.index')

  var bitset = new TypedFastBitSet()
  for (var i = 0; i < 10; i += 2) bitset.add(i)

  saveBitsetFile(filename, 1, 123, bitset, (err) => {
    loadBitsetFile(filename, (err, index) => {
      t.error(err, 'no error')
      t.equal(index.version, 1)
      let loadedBitset = index.bitset
      t.deepEqual(bitset.array(), loadedBitset.array())
      loadedBitset.add(10)

      saveBitsetFile(filename, 1, 1234, loadedBitset, (err) => {
        loadBitsetFile(filename, (err, index) => {
          t.equal(index.version, 1)
          t.error(err, 'no error')
          let loadedBitset2 = index.bitset
          t.deepEqual(loadedBitset.array(), loadedBitset2.array())
          t.end()
        })
      })
    })
  })
})

test('save and load TypedArray for seq', (t) => {
  const idxDir = path.join(dir, 'indexesSaveLoadSeq')
  mkdirp.sync(idxDir)
  const filename = path.join(idxDir, 'test.index')

  var tarr = new Uint32Array(16 * 1000)
  for (var i = 0; i < 10; i += 1) tarr[i] = i

  saveTypedArrayFile(filename, 1, 123, 10, tarr, (err) => {
    loadTypedArrayFile(filename, Uint32Array, (err, loadedIdx) => {
      t.equal(loadedIdx.tarr.length, 10 * 1.1, 'file trimmed')

      for (var i = 0; i < 10; i += 1) t.equal(tarr[i], loadedIdx.tarr[i])

      loadedIdx.tarr[10] = 10

      saveTypedArrayFile(filename, 1, 1234, 11, loadedIdx.tarr, (err) => {
        loadTypedArrayFile(filename, Uint32Array, (err, loadedIdx2) => {
          for (var i = 0; i < 11; i += 1)
            t.equal(loadedIdx.tarr[i], loadedIdx2.tarr[i])
          t.end()
        })
      })
    })
  })
})

test('save and load TypedArray for timestamp', (t) => {
  const idxDir = path.join(dir, 'indexesSaveLoadTimestamp')
  mkdirp.sync(idxDir)
  const filename = path.join(idxDir, 'test.index')

  var tarr = new Float64Array(16 * 1000)
  for (var i = 0; i < 10; i += 1) tarr[i] = i * 1000000

  saveTypedArrayFile(filename, 1, 123, 10, tarr, (err) => {
    loadTypedArrayFile(filename, Float64Array, (err, loadedIdx) => {
      t.error(err, 'no error')
      for (var i = 0; i < 10; i += 1) t.equal(tarr[i], loadedIdx.tarr[i])

      loadedIdx.tarr[10] = 10 * 1000000

      saveTypedArrayFile(filename, 1, 1234, 11, loadedIdx.tarr, (err) => {
        loadTypedArrayFile(filename, Float64Array, (err, loadedIdx2) => {
          for (var i = 0; i < 11; i += 1)
            t.equal(loadedIdx.tarr[i], loadedIdx2.tarr[i])
          t.end()
        })
      })
    })
  })
})

test('save and load prefix map', (t) => {
  const idxDir = path.join(dir, 'indexesSaveLoadPrefix')
  mkdirp.sync(idxDir)
  const filename = path.join(idxDir, 'test.index')

  var map = { 1: [1, 2, 3] }

  savePrefixMapFile(filename, 1, 123, 10, map, (err) => {
    loadPrefixMapFile(filename, (err, loadedIdx) => {
      t.error(err, 'no error')
      t.deepEqual(map, loadedIdx.map)

      map[2] = [1, 2]

      savePrefixMapFile(filename, 1, 1234, 11, map, (err) => {
        loadPrefixMapFile(filename, (err, loadedIdx2) => {
          t.deepEqual(map, loadedIdx2.map)
          t.end()
        })
      })
    })
  })
})

test('load non-existing file', (t) => {
  const filename = path.join('/IDontExist', 'test.index')

  loadBitsetFile(filename, (err, index) => {
    t.equal(err.code, 'ENOENT')
    t.end()
  })
})
