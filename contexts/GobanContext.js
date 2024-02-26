import React, { createContext, useContext } from 'react';
import Goban from '../components/Goban';

const GobanContext = createContext();

export const GobanProvider = ({ children }) => {
  const goban = new Goban(19);

  return (
    <GobanContext.Provider value={goban}>
      {children}
    </GobanContext.Provider>
  );
};

export const useGoban = () => {
  const context = useContext(GobanContext);
  if (!context) {
    throw new Error('useGoban must be used within a GobanProvider');
  }
  return context;
};
