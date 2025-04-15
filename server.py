import http.server
import socketserver
import os
import sys

# Default port to use
PORT = 8000
DIRECTORY = "."

# Check if port 8000 is available, otherwise increment and try next available port
def find_available_port(start_port):
    port = start_port
    while True:
        try:
            with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler):
                return port
        except OSError:
            port += 1  # Try the next port if the current one is unavailable

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    global PORT
    os.chdir(os.path.dirname(os.path.abspath(__file__)))  # Change to the script's directory
    
    PORT = find_available_port(PORT)  # Find the first available port starting from 8000
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == "__main__":
    run_server()
