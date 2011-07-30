#!/usr/bin/env node

require('../plugins/seen')

var Nib = require('../index').Nib

var n = new Nib({ 'host':    'localhost'
                , 'port':    6667
                , 'ssl':     false
                , 'channel': '#test'
                , 'nick':    'nib'
                })

process.on('SIGINT', function() {
  n.quit()
})
