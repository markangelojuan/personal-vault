// hooks/useInactivityLogout.ts
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../utils/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import toast from "react-hot-toast";

export const useInactivite = (timeoutMinutes: number = 10) => {
  const { user, logout } = useAuth();
  const INACTIVITY_TIMEOUT = timeoutMinutes * 60 * 1000;

  useEffect(() => {
    let inactivityTimer: number;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        logAudit(user?.email || 'unknown', AUDIT_ACTIONS.SESSION_ENDED);
        toast.success("Session expired huhu 🔒");
        await logout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user, logout, INACTIVITY_TIMEOUT]);
};