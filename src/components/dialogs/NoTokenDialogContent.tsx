import React from 'react';

/**
 * Content for the no-token dialog shown when authentication is required.
 */
export const NoTokenDialogContent: React.FC = () => (
  <div className="kbase-token-expired">
    <p>
      <strong>No KBase session token found.</strong>
    </p>
    <p>You must authenticate with KBase to use this notebook server.</p>
  </div>
);
