var assert = require('assert');
var assertText = require('assert-text');
var tarjan = require('../../');
var pipeline = require('json-pipeline');

assertText.options.trim = true;

function parse(root, src) {
  var p = pipeline.create('dominance');

  src = src.toString()
           .replace(/^function.*{\/\*|\*\/}$/g, '');

  var lines = src.split(/\r\n|\r|\n/g);
  var nodes = {};

  // Create the root first
  toNode(root);

  function toNode(id) {
    if (!nodes.hasOwnProperty(id)) {
      nodes[id] = p.block();

      // Just for debugging
      nodes[id].label = id;
    }
    return nodes[id];
  }

  lines.forEach(function(line) {
    var match = line.match(/([\w\d]+)\s*->\s*((?:[\w\d]+(?:\s*,\s*)?)*)/);
    if (match === null)
      return;

    var parent = toNode(match[1]);
    var successors = match[2].split(/\s*,\s*/g).map(toNode);

    successors.forEach(function(succ) {
      parent.jump(succ);
    });
  });

  return p;
}

function stringify(p) {
  var list = p.blocks.slice().sort(function(a, b) {
    return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
  });

  var idom = list.filter(function(item) {
    return item.children && item.children.length !== 0;
  }).map(function(item) {
    return '  ' + item.label + ' -> ' + item.children.map(function(item) {
      return item.label;
    }).sort().join(', ');
  }).join('\n');

  var df = list.filter(function(item) {
    return item.frontier && item.frontier.length !== 0;
  }).map(function(item) {
    return '  ' + item.label + ' -> ' + item.frontier.map(function(item) {
      return item.label;
    }).sort().join(', ');
  }).join('\n');

  var hasLoops = false;
  var depth = list.map(function(item) {
    if (item.loopDepth)
      hasLoops = true;
    return '  ' + item.label + ' : ' + item.loopDepth;
  }).join('\n');

  var out = 'IDOM:\n' + idom + '\nDF:\n' + df;
  if (hasLoops)
    out += '\nDEPTH:\n' + depth;
  return out;
}

exports.test = function test(root, input, expected) {
  var p = parse(root, input);

  var t = tarjan.create(p);
  t.compute();

  var out = stringify(p);
  var exp = expected.toString()
                    .replace(/^function.*{\/\*|\*\/}$/g, '');

  assertText.equal(out, exp);
}
