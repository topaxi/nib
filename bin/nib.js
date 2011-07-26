#!/usr/bin/env node

var Ngib = require('../index').Nib

var n = new Ngib({ 'host':    'localhost'
                 , 'port':    6667
                 , 'channel': '#test'
                 , 'nick':    'nib'
                 })

process.on('SIGINT', function() {
  n.quit()
})
