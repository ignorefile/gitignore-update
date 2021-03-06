'use strict';
var fs = require('fs');

var through = require('through');
var async = require('async');
var _ = require('underscore');

var walker = require('./lib/walk');

var customTpls = require('./res/gitignore_tpl.json');

var srcPath = process.argv[2];
var dstPath = process.argv[3];

async.waterfall([
	function(callback) {
		walker(srcPath, [], function(err, result) {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	},
	function(filelist, callback) {
		async.reduce(filelist, {}, function(memo, item, callback) {
			fs.createReadStream(item).pipe(through(function write(buf) {
				var itemname = item.split('/').pop().split('.')[0].toLowerCase();
				memo[itemname] = '#=<<< ' + itemname + ' =#\n' +  buf.toString() + '\n#= ' + itemname + ' >>>=#';
				callback(null, memo);
			}));
		}, function(err, result) {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});

	},
	function(results, callback) {
		results = _.extend(customTpls, results);
		if (dstPath.lastIndexOf('/') !== dstPath.length - 1) {
			dstPath = dstPath + '/';
		}
		fs.createWriteStream(dstPath + 'lib/tpl.json', {
			flags: 'w'
		}).end(JSON.stringify(results));
	}
]);