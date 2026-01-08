import React from 'react';

/**
 * Content for the blocking dialog shown when the token has expired.
 */
export const BlockingDialogContent: React.FC = () => (
  <div className="kbase-token-expired">
    <p>
      <strong>Your session token has expired.</strong>
    </p>
    <p>You must re-authenticate with KBase to continue working.</p>
    <p>
      Any unsaved work may be lost. Please save your notebooks before
      re-authenticating.
    </p>
  </div>
);
