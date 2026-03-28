import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  }, []);

  const fetchStats = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_stats")
      .select("games_played, wins, losses, draws")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching stats:", error);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchStats(session.user.id)
        ]).then(([profileData, statsData]) => {
          setProfile(profileData);
          setStats(statsData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchStats(session.user.id)
        ]).then(([profileData, statsData]) => {
          setProfile(profileData);
          setStats(statsData);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setStats(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchStats]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const updateDisplayName = useCallback(async (newDisplayName: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_profiles")
      .update({ display_name: newDisplayName })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating display name:", error);
      throw error;
    }

    const updatedProfile = await fetchProfile(user.id);
    setProfile(updatedProfile);
  }, [user, fetchProfile]);

  const refreshStats = useCallback(async () => {
    if (!user) return;
    const statsData = await fetchStats(user.id);
    setStats(statsData);
  }, [user, fetchStats]);

  return {
    user,
    profile,
    stats,
    session,
    loading,
    signInWithGoogle,
    signOut,
    updateDisplayName,
    refreshStats,
  };
}
