import React from 'react';

import {InfoProvider} from './info';

interface Props {
  children: React.ReactNode;
}

const AppProvider = ({children}: Props) => {
  return (
    <InfoProvider>
     {children}
    </InfoProvider>
  );
};

export default AppProvider;