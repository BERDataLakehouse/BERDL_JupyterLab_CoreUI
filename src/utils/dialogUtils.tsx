import React from 'react';
import { Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { createRoot } from 'react-dom/client';
import {
  NoTokenDialogContent,
  WarningDialogContent,
  BlockingDialogContent
} from '../components/dialogs';

// Track the current dialog so it can be dismissed
let currentDialog: Dialog<unknown> | null = null;

/**
 * Renders a React element into a JupyterLab Widget for use in dialogs.
 */
const renderToWidget = (element: JSX.Element): Widget => {
  const widget = new Widget();
  createRoot(widget.node).render(element);
  return widget;
};

/**
 * Dismiss any currently open dialog.
 */
export const dismissCurrentDialog = (): void => {
  if (currentDialog) {
    currentDialog.dispose();
    currentDialog = null;
  }
};

/**
 * Show a dialog, dismissing any existing one first.
 */
const showTrackedDialog = <T,>(
  options: Partial<Dialog.IOptions<T>>
): Promise<Dialog.IResult<T>> => {
  dismissCurrentDialog();
  const dialog = new Dialog(options);
  currentDialog = dialog as Dialog<unknown>;
  return dialog.launch().then(result => {
    currentDialog = null;
    return result;
  });
};

/**
 * Shows the authentication required dialog (blocking).
 */
export const showNoTokenDialog = async (): Promise<void> => {
  await showTrackedDialog({
    title: 'Authentication Required',
    body: renderToWidget(<NoTokenDialogContent />),
    buttons: [Dialog.okButton({ label: 'Authenticate' })],
    hasClose: false
  });
};

/**
 * Shows the session expiring warning dialog (dismissible).
 * @returns true if user chose to re-authenticate, false if dismissed
 */
export const showWarningDialog = async (
  minutesLeft: number
): Promise<boolean> => {
  const result = await showTrackedDialog({
    title: 'Session Expiring Soon',
    body: renderToWidget(<WarningDialogContent minutesLeft={minutesLeft} />),
    buttons: [
      Dialog.cancelButton({ label: 'Dismiss' }),
      Dialog.okButton({ label: 'Re-authenticate' })
    ]
  });
  return result.button.accept;
};

/**
 * Shows the session expired dialog (blocking).
 */
export const showBlockingDialog = async (): Promise<void> => {
  await showTrackedDialog({
    title: 'Session Expired',
    body: renderToWidget(<BlockingDialogContent />),
    buttons: [Dialog.okButton({ label: 'Re-authenticate' })],
    hasClose: false
  });
};
