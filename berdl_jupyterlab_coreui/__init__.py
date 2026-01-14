import os

try:
    from ._version import __version__
except ImportError:
    import warnings
    warnings.warn("Importing 'berdl_jupyterlab_coreui' outside a proper installation.")
    __version__ = "dev"


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "berdl-jupyterlab-coreui"
    }]


def _jupyter_server_extension_points():
    return [{"module": "berdl_jupyterlab_coreui"}]


def _load_jupyter_server_extension(server_app):
    """Set KBase configuration in PageConfig from environment variables."""
    page_config = server_app.web_app.settings.setdefault("page_config_data", {})

    if kbase_origin := os.environ.get("KBASE_ORIGIN"):
        page_config["kbaseOrigin"] = kbase_origin

    server_app.log.info("Registered berdl_jupyterlab_coreui server extension")
