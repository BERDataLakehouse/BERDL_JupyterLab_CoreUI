import logging
import os
from pathlib import Path

import tornado.web
from jupyter_server.base.handlers import APIHandler

logger = logging.getLogger(__name__)

TOKEN_CACHE_FILE = ".berdl_kbase_session"


def _get_token_cache_path() -> Path:
    return Path.home() / TOKEN_CACHE_FILE


class TokenSyncHandler(APIHandler):
    """Sync the browser's KBase session cookie into the server process env.

    Updates os.environ["KBASE_AUTH_TOKEN"] in the Jupyter server process and
    writes the token to ~/.berdl_kbase_session so that kernel subprocesses can
    pick up the fresh token without an HTTP round-trip.
    """

    @tornado.web.authenticated
    async def post(self):
        token = (
            self.get_cookie("kbase_session")
            or self.get_cookie("kbase_session_backup")
        )
        if not token:
            raise tornado.web.HTTPError(400, reason="No kbase_session cookie found")

        os.environ["KBASE_AUTH_TOKEN"] = token

        try:
            path = _get_token_cache_path()
            fd = os.open(str(path), os.O_CREAT | os.O_WRONLY | os.O_TRUNC, 0o600)
            try:
                os.write(fd, token.encode())
            finally:
                os.close(fd)
        except OSError:
            logger.warning("Failed to write token cache file", exc_info=True)

        self.set_status(204)
        self.finish()
