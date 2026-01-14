import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TokenMonitor } from './components/TokenMonitor';
import { registerDebugCommands } from './debug';
import { isLocalDev } from './utils/auth';
import React from 'react';

const EXTENSION_ID = 'berdl-jupyterlab-coreui';
const PLUGIN_ID = `${EXTENSION_ID}:plugin`;

/**
 * BERDL JupyterLab CoreUI extension plugin.
 * Provides KBase branding and token expiration monitoring.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description:
    'A JupyterLab extension providing branding and token management for KBase CDM JupyterLab.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log(`JupyterLab extension ${EXTENSION_ID} is activated!`);

    // Skip token monitoring in local development
    if (isLocalDev()) {
      console.log(
        `${EXTENSION_ID}: Local dev detected, skipping token monitor`
      );
      registerDebugCommands();
      return;
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 1000 * 60 * 5
        }
      }
    });

    // Hidden widget that hosts the token expiration monitor
    const monitorWidget = ReactWidget.create(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(TokenMonitor)
      )
    );

    monitorWidget.id = 'kbase-token-monitor';
    monitorWidget.title.label = '';
    monitorWidget.title.closable = false;
    monitorWidget.node.style.display = 'none';

    // Add to shell to trigger React mounting
    app.shell.add(monitorWidget, 'bottom');
  }
};

export default plugin;
