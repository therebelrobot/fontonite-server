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

var ttf2web = require('../utils/ttf2web')
var otf2ttf = require('../utils/otf2ttf')
var eot2ttf, woff2ttf, svg2ttf;

var verifyFile = require('../utils/verify-file')
var createArchive = require('../utils/create-archive')

module.exports = {
  // POST to /convert with form-multipart, font= .ttf or .otf font file
  convert: function convertController(req, res, done) {
    var sendError = function (error) {
      console.log('down to send error', error)
      res.send(500, {
        error: true,
        message: error
      })
    }
    var sendSuccess = function (filename) {
      console.log('down to send request')
      res.send(200, {
        conversion: 'success',
        data: {
          expires: moment().add(5, 'minutes').format('X'),
          url: 'http://fontonite.therebelrobot.com/' + filename
        }
      })
    }
    console.log('down to verify')
    verifyFile(req.files).then(function (file) {
        var fileType = file.fileType;
        file.ipaddress = req.connection.remoteAddress
        switch (fileType) {
        case 'otf':
          otf2ttf(file).then(ttf2web).then(createArchive).then(sendSuccess).catch(sendError)
          break
        case 'ttf':
          ttf2web(file).then(createArchive).then(sendSuccess).catch(sendError)
          break
        case 'eot':
          eot2web(file).then(ttf2web).then(createArchive).then(sendSuccess).catch(sendError)
          break
        case 'svg':
          svg2web(file).then(ttf2web).then(createArchive).then(sendSuccess).catch(sendError)
          break
        case 'woff':
          woff2web(file).then(ttf2web).then(createArchive).then(sendSuccess).catch(sendError)
          break
        }

      })
      .catch(sendError)
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
