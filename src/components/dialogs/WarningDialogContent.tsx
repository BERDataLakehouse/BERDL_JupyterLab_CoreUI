import React from 'react';

interface IWarningDialogContentProps {
  minutesLeft: number;
}

/**
 * Content for the warning dialog shown before token expiration.
 */
export const WarningDialogContent: React.FC<IWarningDialogContentProps> = ({
  minutesLeft
}) => (
  <div className="kbase-token-warning">
    <p>
      <strong>
        Your session token will expire in {minutesLeft} minute
        {minutesLeft !== 1 ? 's' : ''}.
      </strong>
    </p>
    <p>To continue working, please re-authenticate with KBase.</p>
    <p>
      You can dismiss this warning, but it will appear again in one minute if
      you haven't re-authenticated.
    </p>
  </div>
);
