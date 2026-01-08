import {
  showNoTokenDialog,
  showWarningDialog,
  showBlockingDialog,
  dismissCurrentDialog
} from './utils/dialogUtils';

/**
 * Register debug commands on window.kbase for testing dialogs.
 *
 * Usage from browser console:
 *   kbase.showNoTokenDialog()      - Authentication required dialog
 *   kbase.showWarningDialog(3)     - Session expiring warning (3 min left)
 *   kbase.showExpiredDialog()      - Session expired dialog
 */
export const registerDebugCommands = (): void => {
  const win = window as unknown as Record<string, unknown>;
  const existing = (win.kbase as Record<string, unknown>) || {};

  win.kbase = {
    ...existing,
    dismissDialog: () => {
      dismissCurrentDialog();
      console.log('[kbase] Dialog dismissed');
    },
    showNoTokenDialog: async () => {
      console.log('[kbase] Showing no-token dialog');
      await showNoTokenDialog();
      console.log('[kbase] Dialog closed');
    },
    showWarningDialog: async (minutesLeft = 3) => {
      console.log(`[kbase] Showing warning dialog (${minutesLeft} min left)`);
      const accepted = await showWarningDialog(minutesLeft);
      console.log(`[kbase] Dialog closed, re-authenticate: ${accepted}`);
      return accepted;
    },
    showExpiredDialog: async () => {
      console.log('[kbase] Showing expired dialog');
      await showBlockingDialog();
      console.log('[kbase] Dialog closed');
    }
  };

  console.log(
    '[kbase] Debug commands:\n' +
      '  kbase.dismissDialog()\n' +
      '  kbase.showNoTokenDialog()\n' +
      '  kbase.showWarningDialog(minutes)\n' +
      '  kbase.showExpiredDialog()'
  );
};
