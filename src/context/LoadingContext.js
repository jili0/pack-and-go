"use client";

import { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((category, identifier, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`${category}.${identifier}`]: isLoading,
    }));
  }, []);

  const getLoading = useCallback(
    (category, identifier) => {
      return loadingStates[`${category}.${identifier}`] || false;
    },
    [loadingStates]
  );

  const clearCategory = useCallback((category) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (key.startsWith(`${category}.`)) {
          delete newState[key];
        }
      });
      return newState;
    });
  }, []);

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isAnyLoading = useCallback(
    (category) => {
      if (category) {
        return Object.keys(loadingStates).some(
          (key) => key.startsWith(`${category}.`) && loadingStates[key]
        );
      }
      return Object.values(loadingStates).some(Boolean);
    },
    [loadingStates]
  );

  return (
    <LoadingContext.Provider
      value={{
        setLoading,
        getLoading,
        clearCategory,
        clearAll,
        isAnyLoading,
        loadingStates,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (category, identifier) => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }

  const { setLoading, getLoading } = context;

  const isLoading = getLoading(category, identifier);

  const startLoading = useCallback(() => {
    setLoading(category, identifier, true);
  }, [setLoading, category, identifier]);

  const stopLoading = useCallback(() => {
    setLoading(category, identifier, false);
  }, [setLoading, category, identifier]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading: (state) => setLoading(category, identifier, state),
  };
};

export const useLoadingGlobal = () => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoadingGlobal must be used within a LoadingProvider");
  }

  return context;
};
