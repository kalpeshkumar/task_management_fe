// ============================================================================
// EMPLOYEE FIRST-TIME LOGIN – SET PASSWORD SCREEN
// Delegates seamlessly to the unified 4-step authentication flow (Step 3: Set Password)
// ensuring 100% design and functional parity whether accessed directly or via /login.
// ============================================================================

import React from 'react';
import { Login } from './Login';

export const SetPassword = () => {
  return <Login initialStep={3} />;
};

export default SetPassword;
