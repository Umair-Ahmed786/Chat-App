import React, { createContext, useState } from 'react';

// Create a context
const AlertContext = createContext();

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  // Function to show alert for 5 seconds
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null); // Clear the alert after 5 seconds
    }, 3000);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export  { AlertContext, AlertProvider };
export default AlertProvider;