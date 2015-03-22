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

var restify = require('restify')

var convertFont = require('./controllers/convert')

var server = restify.createServer()

server.use(restify.authorizationParser())
server.use(restify.queryParser())
server.use(restify.bodyParser())

server.get('/legal', convertFont.legal)
server.post('/convert', convertFont.convert)

server.listen(8080, function serverListen() {
  console.log('%s listening at %s', server.name, server.url)
})
