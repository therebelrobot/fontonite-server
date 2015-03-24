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


module.exports = function verifyFileUtil(files) {
  return new Promise(function (resolve, reject) {
    if (!files) {
      reject('No file was found in POST parameters. Please send a font to convert.')
    }
    else if (!files.font) {
      reject('A file was included, but was not named appropriately. Please name your parameter "font" when uploading.')
    }
    else {
      var file = files.font
      var fileType = file.name.split('.')
      file.fileType = fileType[fileType.length - 1].toLowerCase();
      if (file.fileType !== 'otf' &&
          file.fileType !== 'ttf' &&
          file.fileType !== 'woff' &&
          file.fileType !== 'svg' &&
          file.fileType !== 'eot') {
        reject('Wrong format. Please only upload otf, ttf, woff, svg, or eot files.')
      }
      if (file.size > 100000000) {
        reject('File too big. Please keep file sizes below 100M')
      }
      resolve(file);
    }
  })
}
