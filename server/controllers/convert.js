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
var exec = require('child_process').exec
var otf2ttfGulp = require('otf2ttf')
var vinyl = require('vinyl-fs')
var moment = require('moment')
var _ = require('lodash')
var JSZip = require('jszip')
var fs = require('fs')

module.exports = {
  // POST to /convert with form-multipart, font= .ttf or .otf font file
  convert: function convertController(req, res, done) {
    if (!req.files) {
      res.send(400, {
        error: true,
        message: 'No file was found in POST parameters. Please send a font to convert.'
      })
      return
    }
    else if (!req.files.font) {
      res.send(400, {
        error: true,
        message: 'A file was included, but was not named appropriately. Please name your parameter "font" when uploading.'
      })
      return
    }
    var file = req.files.font
    var fileType = file.name.split('.')
    fileType = fileType[fileType.length - 1].toLowerCase();
    if (fileType !== 'otf' && fileType !== 'ttf' && fileType !== 'woff' && fileType !== 'svg' && fileType !== 'eot') {
      res.send(400, {
        error: true,
        message: 'Wrong format. Please only upload otf, ttf, woff, svg, or eot files.'
      })
    }
    if (file.size > 100000000) {
      res.send(400, {
        error: true,
        message: 'File too big. Please keep file sizes below 100M'
      })
    }
    var createArchive = function (files) {
      var fontFiles = _.values(files);
      var date = moment().format('YYYY-MM-DD-HHmmss')
      var filename = file.name.split('.')[0];
      var zip = new JSZip();

      zip.file("legal.txt", "The use of this tool constitutes acknowlegement that you have legally obtained the rights to copy/convert/display this font. Please ensure you follow all necessary legal procedures to properly convert this font.");

      var fonts = zip.folder(filename);
      fonts.file(filename+'.ttf', fs.readFileSync(files.ttf, {encoding:'base64'}), {base64: true});
      fonts.file(filename+'.eot', fs.readFileSync(files.eot, {encoding:'base64'}), {base64: true});
      fonts.file(filename+'.svg', fs.readFileSync(files.svg, {encoding:'base64'}), {base64: true});
      fonts.file(filename+'.woff', fs.readFileSync(files.woff, {encoding:'base64'}), {base64: true});


      var content = zip.generate({type:"nodebuffer"});
      // res.send(content, {
        // 'Content-Type': 'application/zip'
      // })
      fs.writeFile('webfont-'+date+'.zip', content, function(err) {
        if (err) throw err;
      });
    }
    var errorHandler = function (error) {
      console.log('errorHandler', error)
      res.send(500, {
        error: true,
        message: error
      })
      return
    }
    switch (fileType) {
    case 'otf':
      otf2ttf(file).then(createArchive).catch(errorHandler)
      break
    case 'ttf':
      ttf2web(file).then(createArchive).catch(errorHandler)
      break
    case 'otf':
      otf2web(file).then(createArchive).catch(errorHandler)
      break
    case 'svg':
      svg2web(file).then(createArchive).catch(errorHandler)
      break
    case 'woff':
      woff2web(file).then(createArchive).catch(errorHandler)
      break
    }
    return
  },
  legal: function legalmumbojumbo(req, res, done) {
    res.send(200, {
      disclaimer: `Use of this tool constitutes acknowledgement
                   that you (the uploader) have legal right to use and convert
                   the fonts being converted. Under no circumstances can the
                   server owner nor the server author be held liable for the
                   misuse of this service. No data is stored on our services.
                   Please ensure you have followed all necessary legal procedures
                   to ensure your appropriate use of the font you upload.`
    })
  }
}

function otf2ttf(file) {
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
        fontName = file.data.fontName
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

function ttf2web(file) {
  return new Promise(function (resolve, reject) {
    var conversionSuccess = function () {
      var otherfiles = file.path
      if (otherfiles.indexOf('.ttf') > -1) {
        otherfiles = file.path.split('.ttf')[0]
      }
      var newFiles = {
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

function otf2web(file) {
  return new Promise(function (resolve, reject) {
    var newFilePath
    resolve(ttf2web(newFilePath))
  })
}

function svg2web(file) {
  return new Promise(function (resolve, reject) {
    var newFilePath
    resolve(ttf2web(newFilePath))
  })
}

function woff2web(file) {
  return new Promise(function (resolve, reject) {
    var newFilePath
    resolve(ttf2web(newFilePath))
  })
}
