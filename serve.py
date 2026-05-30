import os
os.chdir('/Users/balajiiswaroopandhavarapu/Downloads/CLAUDE')
import http.server, socketserver
PORT = 3456
Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
