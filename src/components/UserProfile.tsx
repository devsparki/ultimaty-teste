import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CreditCard as Edit2, Check, X, Trophy, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  onBack: () => void;
}

export default function UserProfile({ onBack }: UserProfileProps) {
  const { profile, stats, updateDisplayName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) return;

    setSaving(true);
    try {
      await updateDisplayName(newName.trim());
      setEditing(false);
      setNewName("");
    } catch (error) {
      console.error("Failed to update name:", error);
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.display_name || profile?.full_name || "Jogador";
  const winRate = stats && stats.games_played > 0
    ? Math.round((stats.wins / stats.games_played) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="futuristic-bg" />

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="neon-card p-8 mb-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center mb-4 overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {editing ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Novo nome"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground font-[Orbitron] text-center focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                  maxLength={20}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !newName.trim()}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setNewName("");
                  }}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-[Orbitron] text-2xl font-bold text-foreground">
                  {displayName}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-all"
                  title="Editar nome"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-[Orbitron] font-semibold text-foreground mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Estatísticas
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="neon-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground font-[Orbitron]">
                  {stats?.games_played || 0}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Partidas
                </p>
              </div>

              <div className="neon-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-primary font-[Orbitron]">
                  {winRate}%
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Vitórias
                </p>
              </div>

              <div className={cn(
                "neon-card p-4 text-center",
                "border-player-x/30"
              )}>
                <p className="text-2xl font-bold text-player-x font-[Orbitron]">
                  {stats?.wins || 0}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Ganhou
                </p>
              </div>

              <div className={cn(
                "neon-card p-4 text-center",
                "border-player-o/30"
              )}>
                <p className="text-2xl font-bold text-player-o font-[Orbitron]">
                  {stats?.losses || 0}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Perdeu
                </p>
              </div>
            </div>

            {stats && stats.draws > 0 && (
              <div className="neon-card p-4 text-center mt-3">
                <p className="text-xl font-bold text-muted-foreground font-[Orbitron]">
                  {stats.draws}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Empates
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
