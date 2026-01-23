import React from 'react';

/**
 * Content for the change profile confirmation dialog.
 */
export const ChangeProfileDialogContent: React.FC = () => (
  <div className="berdl-change-profile-dialog">
    <p>You'll be taken to the Hub control panel.</p>
    <p>
      Click <strong>Stop My Server</strong>, then{' '}
      <strong>Start My Server</strong> to choose a new profile.
    </p>
    <p>
      <strong>Any unsaved work will be lost.</strong>
    </p>
  </div>
);
