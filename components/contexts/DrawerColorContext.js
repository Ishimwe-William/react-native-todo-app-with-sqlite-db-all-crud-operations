// DrawerColorContext.js
import React, { createContext, useState } from 'react';

export const DrawerColorContext = createContext();

export const DrawerColorProvider = ({ children }) => {
    const [drawerColor, setDrawerColor] = useState('gray');

    return (
        <DrawerColorContext.Provider value={{ drawerColor, setDrawerColor }}>
            {children}
        </DrawerColorContext.Provider>
    );
};
