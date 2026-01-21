import React from 'react';

/**
 * Content for the change profile confirmation dialog.
 */
export const ChangeProfileDialogContent: React.FC = () => (
  <div className="berdl-change-profile-dialog">
    <p>This will stop your current server and Spark cluster.</p>
    <p>
      <strong>Any unsaved work will be lost.</strong>
    </p>
    <p>You will be redirected to choose a new profile.</p>
  </div>
);
