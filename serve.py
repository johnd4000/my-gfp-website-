"""
Local preview server for the Partners in Planning site.

Identical to `python -m http.server`, except it tells the browser never to
cache anything. Plain http.server lets Chrome hold on to old CSS/JS, so you
edit a file, reload, and still see the previous version — which is confusing
and easy to mistake for "my change didn't work".

Usage:
    python serve.py            (then open http://localhost:8080)
    python serve.py 3000       (to use a different port)

Dev only. Do not deploy this file.
"""

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # Ignore the browser's "do I still have the current version?" question --
    # always send the file, so a reload can never serve something stale.
    def send_head(self):
        self.headers.replace_header("If-Modified-Since", "") \
            if "If-Modified-Since" in self.headers else None
        if "If-None-Match" in self.headers:
            del self.headers["If-None-Match"]
        return super().send_head()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = ThreadingHTTPServer(("", port), NoCacheHandler)
    print(f"Serving this folder at http://localhost:{port}  (caching disabled)")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
