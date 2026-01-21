import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TokenMonitor } from './components/TokenMonitor';
import { ProfileWidget } from './components/ProfileWidget';
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

    // Override hub:restart to redirect to user URL instead of /hub/spawn
    // This allows implicit_spawn_seconds to auto-spawn with the previous profile
    const hubUser = PageConfig.getOption('hubUser');
    const baseUrl = PageConfig.getOption('baseUrl') || `/user/${hubUser}/`;
    if (hubUser) {
      app.commands.addCommand('hub:restart', {
        label: 'Restart Server',
        caption: 'Request that the Hub restart this server',
        execute: () => {
          // Redirect to user URL - implicit_spawn_seconds will auto-spawn
          window.location.href = baseUrl;
        }
      });
    }

    // Add profile widget to header (visible in both local dev and production)
    const profileWidget = ReactWidget.create(
      React.createElement(ProfileWidget)
    );
    profileWidget.id = 'berdl-profile-widget';
    profileWidget.addClass('berdl-profile-widget-container');
    app.shell.add(profileWidget, 'top');

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
