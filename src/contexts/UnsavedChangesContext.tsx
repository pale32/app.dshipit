"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  shouldShakeSettingsButtons: boolean;
  triggerSettingsButtonsShake: () => void;
  checkAndPreventNavigation: () => boolean; // Returns true if navigation should be prevented
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useUnsavedChanges must be used within a UnsavedChangesProvider");
  }
  return context;
};

interface UnsavedChangesProviderProps {
  children: ReactNode;
}

export const UnsavedChangesProvider = ({ children }: UnsavedChangesProviderProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [shouldShakeSettingsButtons, setShouldShakeSettingsButtons] = useState(false);

  const triggerSettingsButtonsShake = useCallback(() => {
    setShouldShakeSettingsButtons(true);
    setTimeout(() => setShouldShakeSettingsButtons(false), 800);
  }, []);

  const checkAndPreventNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      triggerSettingsButtonsShake(); // Shake the settings buttons, not the sidebar
      return true; // Prevent navigation
    }
    return false; // Allow navigation
  }, [hasUnsavedChanges, triggerSettingsButtonsShake]);

  const value = {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    shouldShakeSettingsButtons,
    triggerSettingsButtonsShake,
    checkAndPreventNavigation,
  };

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
};