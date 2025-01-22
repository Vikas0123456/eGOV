// import React, { useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AutoLogout = ({ children }) => {
//   const navigate = useNavigate();
//   const INACTIVITY_LIMIT = 60 * 1000; // 1 minute for testing

//   const logoutUser = useCallback(() => {
//     console.log("User is being logged out due to inactivity.");
//     localStorage.removeItem('userData'); // Remove auth token or other session info
//     localStorage.removeItem('userPermission'); // Remove auth token or other session info

//     navigate('/');
//   }, [navigate]);

//   // Reset timer on user activity
//   const resetTimer = useCallback(() => {
//     console.log("User activity detected, resetting timer.");
//     clearTimeout(window.inactivityTimer); // Clear any existing timer
//     window.inactivityTimer = setTimeout(logoutUser, INACTIVITY_LIMIT); // Set new inactivity timer
//     console.log("Inactivity timer started.");
//   }, [logoutUser]);

//   useEffect(() => {
//     // Set initial timer
//     resetTimer();

//     // Attach event listeners for user activity
//     window.addEventListener('mousemove', resetTimer);
//     window.addEventListener('keydown', resetTimer);
//     window.addEventListener('click', resetTimer);
//     window.addEventListener('scroll', resetTimer); // Add scroll event listener

//     return () => {
//       clearTimeout(window.inactivityTimer); // Cleanup on unmount
//       window.removeEventListener('mousemove', resetTimer);
//       window.removeEventListener('keydown', resetTimer);
//       window.removeEventListener('click', resetTimer);
//       window.removeEventListener('scroll', resetTimer); // Remove scroll event listener
//       console.log("Inactivity timer cleared on cleanup.");
//     };
//   }, [resetTimer]);

//   return <>{children}</>;
// };

// export default AutoLogout;
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();
  const INACTIVITY_LIMIT = 60 * 500; // 1 minute for testing
  const LAST_ACTIVITY_KEY = 'lastActivityTime';

  const logoutUser = useCallback(() => {
    console.log("User is being logged out due to inactivity.");
    localStorage.removeItem('userData');
    localStorage.removeItem('userPermission');
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    navigate('/');
  }, [navigate]);

  // Reset timer and update localStorage on user activity
  const resetTimer = useCallback(() => {
    console.log("User activity detected, resetting timer.");
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, now); // Update activity timestamp in localStorage
    clearTimeout(window.inactivityTimer);
    window.inactivityTimer = setTimeout(logoutUser, INACTIVITY_LIMIT);
  }, [logoutUser]);

  // Check activity timestamps across tabs
  const checkActivity = useCallback(() => {
    const lastActivityTime = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY), 10);
    const now = Date.now();

    if (!lastActivityTime || now - lastActivityTime > INACTIVITY_LIMIT) {
      logoutUser();
    } else {
      resetTimer(); // Reset timer if activity is valid
    }
  }, [logoutUser, resetTimer]);

  useEffect(() => {
    // Initialize localStorage key and set timer
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now());
    }
    resetTimer();

    // Attach activity listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('storage', checkActivity); // Listen to storage events for cross-tab sync

    return () => {
      clearTimeout(window.inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('storage', checkActivity);
      console.log("Inactivity listeners removed on cleanup.");
    };
  }, [resetTimer, checkActivity]);

  return <>{children}</>;
};

export default AutoLogout;
