import React, { useContext } from 'react';
import { AIChatInterface } from './AIChatInterface';

// Create a context to pass sidebar state from AdminLayout
export const SidebarContext = React.createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
} | null>(null);

export const AIChatWrapper = () => {
  const sidebarContext = useContext(SidebarContext);
  
  return (
    <AIChatInterface 
      sidebarOpen={sidebarContext?.sidebarOpen || false}
      onToggleSidebar={sidebarContext?.toggleSidebar}
    />
  );
};