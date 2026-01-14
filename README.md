# berdl_jupyterlab_coreui

A JupyterLab extension providing branding and token management for KBase CDM JupyterLab.

## Features

- **KBase Branding**: Custom logos for JupyterLab UI (main logo, retro logo, notebook logo)
- **Token Expiration Monitoring**: Monitors KBase session tokens and warns users before expiration
  - Shows warning dialog 5 minutes before token expires
  - Blocks work when token has expired
  - Provides easy re-authentication flow
- **Custom Favicon**: Sets the KBase favicon for the JupyterLab instance
- **Server Extension**: Exposes `KBASE_ORIGIN` environment variable to the frontend via PageConfig
- **Local Development Mode**: Automatically disables token monitoring on localhost or hostnames without dots (e.g., Tailscale)

## Architecture

The extension uses React with React Query for state management and API polling.

### Token Monitoring State Machine

The `TokenMonitor` component implements a state machine with four states:

```
checking → valid → warning → blocked
             ↑        ↓
             └────────┘ (on dismiss, after cooldown)
```

- **checking**: Initial state while fetching token info
- **valid**: Token is valid and not expiring soon
- **warning**: Token expires within 5 minutes, dismissible dialog shown
- **blocked**: Token expired or missing, blocking dialog shown

### Key Components

- `src/index.ts` - JupyterLab plugin entry point
- `src/components/TokenMonitor.tsx` - Invisible React component that orchestrates token monitoring
- `src/hooks/useTokenQuery.ts` - React Query hook for polling token status
- `src/utils/dialogUtils.tsx` - JupyterLab dialog utilities with React content
- `src/constants.ts` - Configuration (warning threshold, cooldown, poll interval)

### Debug Commands

In local development mode (localhost or no-dot hostnames), the extension registers debug commands on `window.kbase`:

```javascript
kbase.showNoTokenDialog(); // Authentication required dialog
kbase.showWarningDialog(3); // Session expiring warning (3 min left)
kbase.showExpiredDialog(); // Session expired dialog
kbase.dismissDialog(); // Dismiss any open dialog
```

These commands are only available in local dev mode to facilitate testing token dialogs without needing a real KBase deployment.

This extension is composed of a Python package named `berdl_jupyterlab_coreui`
for the server extension and a NPM package named `berdl-jupyterlab-coreui`
for the frontend extension.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install berdl_jupyterlab_coreui
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall berdl_jupyterlab_coreui
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

### Development install

This project uses [uv](https://docs.astral.sh/uv/) for Python dependency management. Install uv first if you don't have it.

The `jlpm` command is JupyterLab's pinned version of [yarn](https://yarnpkg.com/) that is installed with JupyterLab.

```bash
# Clone the repo to your local environment
# Change directory to the berdl_jupyterlab_coreui directory

# Install package in development mode (uv creates/manages virtualenv automatically)
uv pip install --editable ".[dev,test]"

# Link your development version of the extension with JupyterLab
uv run jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
uv run jupyter server extension enable berdl_jupyterlab_coreui

# Rebuild extension TypeScript source after making changes
uv run jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
uv run jlpm watch
# Run JupyterLab in another terminal
uv run jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
uv run jupyter lab build --minimize=False
```

### Development uninstall

```bash
# Server extension must be manually disabled in develop mode
uv run jupyter server extension disable berdl_jupyterlab_coreui
uv pip uninstall berdl_jupyterlab_coreui
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `uv run jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `berdl-jupyterlab-coreui` within that folder.

### Testing the extension

#### Server tests

This extension is using [Pytest](https://docs.pytest.org/) for Python code testing.

```sh
uv run pytest -vv -r ap --cov berdl_jupyterlab_coreui
```

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

```sh
uv run jlpm test
```

#### Linting

```sh
uv run jlpm run lint:check  # Check for issues
uv run jlpm run lint        # Auto-fix issues
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
