# berdl_jupyterlab_coreui

A JupyterLab extension providing branding and token management for KBase CDM JupyterLab.

## Features

- **KBase Branding**: Custom logos for JupyterLab UI (main logo, retro logo, notebook logo)
- **Token Expiration Monitoring**: Monitors KBase session tokens and warns users before expiration
  - Shows warning dialog 5 minutes before token expires
  - Blocks work when token has expired
  - Provides easy re-authentication flow
- **Custom Favicon**: Sets the KBase favicon for the JupyterLab instance

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

For testing token dialogs in development, the extension registers debug commands on `window.kbase`:

```javascript
kbase.showNoTokenDialog()      // Authentication required dialog
kbase.showWarningDialog(3)     // Session expiring warning (3 min left)
kbase.showExpiredDialog()      // Session expired dialog
kbase.dismissDialog()          // Dismiss any open dialog
```

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

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the berdl_jupyterlab_coreui directory

# Set up a virtual environment and install package in development mode
python -m venv .venv
source .venv/bin/activate
pip install --editable "."

# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite

# Rebuild extension Typescript source after making changes
# IMPORTANT: Unlike the steps above which are performed only once, do this step
# every time you make a change.
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall berdl_jupyterlab_coreui
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `berdl-jupyterlab-coreui` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
