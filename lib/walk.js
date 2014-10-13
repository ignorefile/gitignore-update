'use strict';
var fs = require('fs');

function walker(dir, excludes, callback) {
    var result = [];
    fs.readdir(dir, function(err, files){
        if (err) {
            callback(err);
        }
        files = files.filter(function(value){
            return (value[0] != '.') && (excludes.indexOf(value) == -1);
        });
        var listLength = files.length;
        if (!listLength) {
            return callback(null, result);
        }
        files.forEach(function(file){
            fs.stat(dir + '/' + file, function(err, stats) {
                if (stats.isFile()) {
                    result.push(dir + '/' + file);
                    if (!--listLength) {
                        callback(null, result);
                    }
                }
                if (stats.isDirectory()) {
                    walker(dir + '/' + file, [], function(err, res){
                        result = result.concat(res);
                        if (!--listLength) {
                            callback(null, result);
                        }
                    });
                }
            });
        });
    });
}

module.exports = walker;