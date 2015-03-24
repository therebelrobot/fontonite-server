/*
 * fontonite-server: API service for converting fonts to webfonts
 * License: ISC
 * Author: Trent Oswald <trentoswald@therebelrobot.com>
 *         @therebelrobot (twitter)
 *         /therebelrobot (github)
 * Copyright (C) 2015, Trent Oswald <trentoswald@therebelrobot.com
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */


var exec = require('child_process').exec
var _ = require('lodash')

module.exports = function ttf2webUtil(file) {
  return new Promise(function (resolve, reject) {
    var conversionSuccess = function () {
      var otherfiles = file.path
      if (otherfiles.indexOf('.ttf') > -1) {
        otherfiles = file.path.split('.ttf')[0]
      }
      var newOrig = _.cloneDeep(file)
      var newFiles = {
        original: newOrig,
        eot: otherfiles + '.eot',
        woff: otherfiles + '.woff',
        svg: otherfiles + '.svg',
        ttf: file.path
      }
      resolve(newFiles);
    }
    exec('webify ' + file.path,
      function (error, stdout, stderr) {
        if (error !== null) {
          reject(error)
          return
        }
        if (stderr !== '') {
          reject(stderr)
          return
        }
        conversionSuccess()
      });
  })
}
