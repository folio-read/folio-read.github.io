import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as profileData from "../data/profile";
import type { Profile, ThemePreference } from "../types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  saveProfile: (changes: { displayName?: string; theme?: ThemePreference }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    profileData
      .getProfile(user.id)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveProfile = useCallback(
    async (changes: { displayName?: string; theme?: ThemePreference }) => {
      if (!user) return;
      const previous = profile;
      setProfile((current) => (current ? { ...current, ...changes } : current));
      try {
        const updated = await profileData.updateProfile(user.id, changes);
        setProfile(updated);
        showToast("Profile updated", { variant: "success" });
      } catch (err) {
        setProfile(previous);
        showToast("Couldn't update profile", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [user, profile, showToast],
  );

  const value = useMemo(() => ({ profile, loading, error, saveProfile }), [profile, loading, error, saveProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
}
