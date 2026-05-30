Dir.chdir('/Users/balajiiswaroopandhavarapu/Downloads/CLAUDE')
require 'webrick'
server = WEBrick::HTTPServer.new(Port: 3456, DocumentRoot: '/Users/balajiiswaroopandhavarapu/Downloads/CLAUDE', AccessLog: [], Logger: WEBrick::Log.new('/dev/null'))
trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }
server.start
