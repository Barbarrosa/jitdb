const bipf = require('bipf');

function query(...cbs) {
  let res = cbs[0];
  for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res);
  return res;
}

function fromDB(db) {
  return {
    meta: {db},
  };
}

function toBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value)
}

function offsets(values) {
  return {
    type: 'OFFSETS',
    offsets: values
  };
}

function seqs(values) {
  return {
    type: 'SEQS',
    seqs: values
  };
}

function seekFromDesc(desc) {
  const keys = desc.split('.')
  return buffer => {
    var p = 0
    for (let key of keys) {
      p = bipf.seekKey(buffer, p, Buffer.from(key))
      if (!~p) return void 0
    }
    return p
  }
}

function slowEqual(seekDesc, value, indexAll) {
  const indexType = seekDesc.replace(/\./g, '_')
  const seek = seekFromDesc(seekDesc)
  return {
    type: 'EQUAL',
    data: {
      seek: seek,
      value: toBuffer(value),
      indexType,
      indexAll,
    },
  };
}

function equal(seek, value, indexType, indexAll) {
  return {
    type: 'EQUAL',
    data: {
      seek: seek,
      value: toBuffer(value),
      indexType,
      indexAll,
    },
  };
}

function gt(value, indexName) {
  return {
    type: 'GT',
    data: {
      value,
      indexName,
    },
  };
}

function gte(value, indexName) {
  return {
    type: 'GTE',
    data: {
      value,
      indexName,
    },
  };
}

function lt(value, indexName) {
  return {
    type: 'LT',
    data: {
      value,
      indexName,
    },
  };
}

function lte(value, indexName) {
  return {
    type: 'LTE',
    data: {
      value,
      indexName,
    },
  };
}

function debug() {
  return (ops) => {
    const meta = JSON.stringify(ops.meta, (key, val) =>
      key === 'db' ? void 0 : val,
    );
    console.log(
      'debug',
      JSON.stringify(ops, (key, val) => {
        if (key === 'meta') return void 0
        else if (key === 'value' && val.type === 'Buffer') return Buffer.from(val.data).toString()
        else return val
      }, 2),
      meta === '{}' ? '' : 'meta: ' + meta,
    );
    return ops;
  };
}

function copyMeta(orig, dest) {
  if (orig.meta) {
    dest.meta = orig.meta;
  }
}

function updateMeta(orig, key, value) {
  const res = Object.assign({}, orig);
  res.meta[key] = value;
  return res;
}

function extractMeta(orig) {
  const meta = orig.meta;
  return meta;
}

function and(...args) {
  const rhs = args.map((arg) => (typeof arg === 'function' ? arg() : arg));
  return (ops) => {
    const res =
      ops && ops.type
        ? {
            type: 'AND',
            data: [ops, ...rhs],
          }
        : rhs.length > 1
        ? {
            type: 'AND',
            data: rhs,
          }
        : rhs[0];
    if (ops) copyMeta(ops, res);
    return res;
  };
}

function or(...args) {
  const rhs = args.map((arg) => (typeof arg === 'function' ? arg() : arg));
  return (ops) => {
    const res =
      ops && ops.type
        ? {
            type: 'OR',
            data: [ops, ...rhs],
          }
        : rhs.length > 1
        ? {
            type: 'OR',
            data: rhs,
          }
        : rhs[0];
    if (ops) copyMeta(ops, res);
    return res;
  };
}

function descending() {
  return (ops) => updateMeta(ops, 'descending', true);
}

function startFrom(offset) {
  return (ops) => updateMeta(ops, 'offset', offset);
}

function paginate(pageSize) {
  return (ops) => updateMeta(ops, 'pageSize', pageSize);
}

function toCallback(cb) {
  return (ops) => {
    const meta = extractMeta(ops);
    const offset = meta.offset || 0
    if (meta.pageSize)
      meta.db.paginate(ops, offset, meta.pageSize, meta.descending, cb);
    else meta.db.all(ops, offset, meta.descending, cb);
  };
}

function toPromise() {
  return (ops) => {
    const meta = extractMeta(ops);
    const offset = meta.offset || 0;
    return new Promise((resolve, reject) => {
      const cb = (err, data) => {
        if (err) reject(err);
        else resolve(data);
      };
      if (meta.pageSize)
        meta.db.paginate(
          ops,
          offset,
          meta.pageSize,
          meta.descending,
          cb,
        );
      else meta.db.all(ops, offset, meta.descending, cb);
    });
  };
}

function toPullStream() {
  return (ops) => {
    const meta = extractMeta(ops);
    let offset = meta.offset || 0;
    let total = Infinity;
    const limit = meta.pageSize || 1;
    return function readable(end, cb) {
      if (end) return cb(end);
      if (offset >= total) return cb(true);
      meta.db.paginate(ops, offset, limit, meta.descending, (err, result) => {
        if (err) return cb(err);
        else {
          total = result.total;
          offset += limit;
          cb(null, !meta.pageSize ? result.data[0] : result.data);
        }
      });
    };
  };
}

// `async function*` supported in Node 10+ and browsers (except IE11)
function toAsyncIter() {
  return async function* (ops) {
    const meta = extractMeta(ops);
    let offset = meta.offset || 0;
    let total = Infinity;
    const limit = meta.pageSize || 1;
    while (offset < total) {
      yield await new Promise((resolve, reject) => {
        meta.db.paginate(ops, offset, limit, meta.descending, (err, result) => {
          if (err) return reject(err);
          else {
            total = result.total;
            offset += limit;
            resolve(!meta.pageSize ? result.data[0] : result.data);
          }
        });
      });
    }
  };
}

module.exports = {
  fromDB,
  query,

  slowEqual,
  equal,
  gt,
  gte,
  lt,
  lte,
  and,
  or,

  offsets,
  seqs,

  descending,
  startFrom,
  paginate,
  toCallback,
  toPullStream,
  toPromise,
  toAsyncIter,

  debug,
};
