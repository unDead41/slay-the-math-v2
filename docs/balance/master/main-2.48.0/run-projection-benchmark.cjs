'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const source=path.join(process.cwd(),'docs/balance/master/ai-data-20261025/projection-benchmark.cjs');
const target="'docs/balance/master/ai-data-20261025/projection-benchmark.json'",out=path.resolve(process.argv[2]);
const original=fs.readFileSync(source,'utf8');assert.equal(original.split(target).length,2);
const adapted=original.replace(target,JSON.stringify(out));
fs.writeFileSync(out+'.executed.cjs',adapted);
new Function('require','module','exports',adapted)(createRequire(source),module,exports);
