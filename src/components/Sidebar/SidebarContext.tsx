import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };
  const toggle = () => {
    setIsOpen((v) => {
      const next = !v;
      return next;
    });
  };

  return <SidebarContext.Provider value={{ isOpen, open, close, toggle }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = (): SidebarContextType => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return ctx;
};
