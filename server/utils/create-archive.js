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

var moment = require('moment')
var JSZip = require('jszip')
var fs = require('fs')

module.exports = function createArchiveUtil(files, font) {
  return new Promise(function (resolve, reject) {
    var font = files.original
    var date = moment().format('YYYY-MM-DD-HHmmss')
    var filename = font.name.split('.')[0]
    font.fontName = font.fontName || filename
    var zip = new JSZip()
    zip.file("legal.txt",  `Use of this tool constitutes acknowledgement
that you (the uploader) have legal right to use and convert
the fonts being converted. Under no circumstances can the
server owner nor the server author be held liable for the
misuse of this service. No data is stored on our services.
Please ensure you have followed all necessary legal procedures
to ensure your appropriate use of the font you upload.`
    )

    zip.file("thanks.txt",  `Thank you for using the Fontonite Font Conversion API.
You can follow updated for this tool at http://therebelrobot.github.io/fontonite.
If you would like assistance with this or any node tool, please don't hesitate to
reach out to me. I am a member of the node-forward/mentors group, and am happy to
provide general assistance with node/iojs issues. Thanks, and node on!`
    )

    // create css file here
    zip.file("fonts.css", `
@font-face{
  font-family: "`+font.fontName+`";
  font-weight: normal;
  font-style: normal;
  src: url("`+filename+`.eot");
  src: url("`+filename+`.eot?#iefix") format('embedded-opentype'),
    url("`+filename+`.svg#`+font.fontName+`") format('svg'),
    url("`+filename+`.woff") format('woff'),
    url("`+filename+`.ttf") format('truetype');
}
`
    )

    var fonts = zip.folder(filename)
    fonts.file(filename + '.ttf', fs.readFileSync(files.ttf, {
      encoding: 'base64'
    }), {
      base64: true
    })
    fonts.file(filename + '.eot', fs.readFileSync(files.eot, {
      encoding: 'base64'
    }), {
      base64: true
    })
    fonts.file(filename + '.svg', fs.readFileSync(files.svg, {
      encoding: 'base64'
    }), {
      base64: true
    })
    fonts.file(filename + '.woff', fs.readFileSync(files.woff, {
      encoding: 'base64'
    }), {
      base64: true
    })

    var content = zip.generate({
      type: "nodebuffer"
    })
    var ipaddress = font.ipaddress.split('.').join('-').split(':').join('_')
    var filename = 'webfont-' + ipaddress + '-' + date + '.zip'
    fs.writeFile('server/tmp/' + filename, content, function (err) {
      if (err) reject('There was an error saving the archive. Please try again later.')
      resolve(filename)
    })
  })
}
