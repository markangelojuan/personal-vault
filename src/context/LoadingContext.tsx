/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";

const LoadingContext = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({ loading: false, setLoading: () => {} });

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoadingState] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const setLoading = (value: boolean) => {
    if (value) {
      setLoadingState(true);
      setShowLoading(true);
    } else {
      setTimeout(() => {
        setLoadingState(false);
        setShowLoading(false);
      }, 700);
    }
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <LoadingScreen isVisible={showLoading} />
      {children}
    </LoadingContext.Provider>
  );
};
export const useLoading = () => useContext(LoadingContext);
