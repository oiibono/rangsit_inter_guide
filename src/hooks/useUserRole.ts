import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "club_admin" | null;

export interface UserRoleInfo {
  role: UserRole;
  clubId: number | null;
  isLoading: boolean;
}

export function useUserRole(): UserRoleInfo {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [clubId, setClubId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return; // still initializing
    if (!session?.user?.id) {
      setRole(null);
      setClubId(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setRole(null);
          setClubId(null);
        } else if (data) {
          setRole((data.role as UserRole) ?? null);
          setClubId(data.club_id ?? null);
        } else {
          setRole(null);
          setClubId(null);
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return { role, clubId, isLoading };
}
