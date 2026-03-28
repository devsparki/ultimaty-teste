import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";

export default function AuthGate() {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="futuristic-bg" />
        <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="futuristic-bg" />

      <div className="w-full max-w-md text-center relative z-10">
        <div className="mb-8">
          <h1 className="neon-title text-4xl md:text-5xl font-black tracking-wider uppercase mb-4">
            Jogo da Velha 2
          </h1>
          <p className="font-[Orbitron] text-lg font-bold tracking-[0.3em] uppercase text-foreground/80 neon-text">
            Desafie. Vença. Repita.
          </p>
        </div>

        <div className="neon-card p-8 mb-6">
          <h2 className="font-[Orbitron] text-xl font-bold text-foreground mb-4 uppercase tracking-wider">
            Entre para jogar
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Faça login para acessar suas estatísticas, ranking e jogar online
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="neon-btn w-full flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
        </div>

        <footer className="text-xs text-muted-foreground">
          <p>
            By <span className="font-semibold text-foreground/70">Gabriel</span> / <span className="font-semibold text-foreground/70">IA Lux & Wise</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
