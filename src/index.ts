import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { startTokenExpirationMonitor } from './tokenExpiration';

const EXTENSION_ID = 'berdl-jupyterlab-coreui';
const PLUGIN_ID = `${EXTENSION_ID}:plugin`;

/**
 * BERDL JupyterLab CoreUI extension plugin
 * Provides KBase branding and token expiration monitoring
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description:
    'A JupyterLab extension providing branding and token management for KBase CDM JupyterLab.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log(`JupyterLab extension ${EXTENSION_ID} is activated!`);

    // Start monitoring token expiration
    startTokenExpirationMonitor();
  }
};

export default plugin;
