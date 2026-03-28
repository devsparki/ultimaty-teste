import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserHeaderProps {
  onProfileClick: () => void;
}

export default function UserHeader({ onProfileClick }: UserHeaderProps) {
  const { profile, signOut } = useAuth();

  const displayName = profile?.display_name || profile?.full_name || "Jogador";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
      <button
        onClick={onProfileClick}
        className="flex items-center gap-3 neon-card px-4 py-2 hover:border-primary/40 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/40 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <span className="font-[Orbitron] font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
          {displayName}
        </span>
      </button>

      <button
        onClick={handleSignOut}
        className="p-2 rounded-lg border border-border bg-card hover:border-destructive/40 hover:bg-destructive/5 transition-all"
        title="Sair"
      >
        <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
      </button>
    </div>
  );
}
