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


var path = require('path')
var vinyl = require('vinyl-fs')
var otf2ttfGulp = require('otf2ttf')

var ttf2web = require('./ttf2web')

module.exports = function otf2ttfUtil(file) {
  return new Promise(function (resolve, reject) {
    var folder = file.path.split('/')
    var tempFile = folder.pop()
    folder = folder.join('/')
    var relPath = path.relative(process.cwd(), file.path)
    var relFolder = path.relative(process.cwd(), folder)
    var fontName
    vinyl.src(relPath)
      .pipe(otf2ttfGulp())
      .pipe(vinyl.dest(function (file) {
        file.fontName = file.data.fontName
        var newRelFilePath = relFolder + '/' + file.data.fontName
        return newRelFilePath
      }))
      .on('end', function () {
        var newFilePath = folder + '/' + fontName + '.ttf';
        file.path = newFilePath
        resolve(ttf2web(file))
      })

  })
}
