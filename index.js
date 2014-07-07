var fs = require('fs');

var through = require('through');
var async = require('async');

var walker = require('./lib/walk');

var srcPath = process.argv[2];
var dstPath = process.argv[3];

async.waterfall([
	function(callback) {
		walker(srcPath, [], function(err, result) {
			if(err) return callback(err)
			callback(null, result)
		});
	},
	function(filelist, callback) {
		async.reduce(filelist, {}, function(memo, item, callback) {
			fs.createReadStream(item).pipe(through(function write(buf) {
				var itemname = item.split('/').pop().split('.')[0].toLowerCase();
				memo[itemname] = buf.toString();
				callback(null, memo)
			}))
		}, function(err, result) {
			if(err) return callback(err)
			callback(null, result)
		})
		
	},
	function(results, callback) {
		console.log(results)
		if(dstPath.lastIndexOf('/') !== dstPath.length - 1) dstPath = dstPath + '/'
		fs.createWriteStream(dstPath + 'lib/tpl.json', {
			flags: 'w'
		}).end(JSON.stringify(results))
	}
])