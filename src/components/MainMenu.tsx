import { useState } from "react";
import { Users, Monitor, Info, X, Instagram, Sparkles, Gamepad2, CircleUser as UserCircle } from "lucide-react";
import UpdateCountdown from "./UpdateCountdown";
import UserHeader from "./UserHeader";

interface MainMenuProps {
  onLocal: () => void;
  onOnline: () => void;
  onProfile: () => void;
}

export default function MainMenu({ onLocal, onOnline, onProfile }: MainMenuProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <div className="futuristic-bg" />

      <UserHeader onProfileClick={onProfile} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center relative z-10">
        {/* Title */}
        <div className="mb-2">
          <h1 className="neon-title text-4xl md:text-5xl font-black tracking-wider uppercase flex items-center justify-center gap-3">
            Jogo da Velha 2
            <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-[0_0_10px_hsl(180_100%_50%/0.5)]" />
          </h1>
        </div>

        {/* Tagline */}
        <div className="mb-8 mt-4">
          <p className="font-[Orbitron] text-lg md:text-xl font-bold tracking-[0.3em] uppercase text-foreground/80 neon-text">
            Desafie. Vença. Repita.
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-8">
          <UpdateCountdown />
        </div>

        {/* Menu buttons */}
        <div className="space-y-3">
          <button
            onClick={onLocal}
            className="neon-card w-full flex items-center gap-4 p-5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-[0_0_10px_hsl(180_100%_50%/0.15)] transition-all">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="font-[Orbitron] font-semibold text-foreground block text-sm uppercase tracking-wider">Jogar Local</span>
              <span className="text-sm text-muted-foreground">2 jogadores no mesmo dispositivo</span>
            </div>
          </button>

          <button
            onClick={onOnline}
            className="neon-card w-full flex items-center gap-4 p-5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover:border-accent/40 group-hover:shadow-[0_0_10px_hsl(280_100%_65%/0.15)] transition-all">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="font-[Orbitron] font-semibold text-foreground block text-sm uppercase tracking-wider">Multiplayer Online</span>
              <span className="text-sm text-muted-foreground">Jogue com um amigo em tempo real</span>
            </div>
          </button>

          <button
            onClick={onProfile}
            className="neon-card w-full flex items-center gap-4 p-5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover:border-accent/40 group-hover:shadow-[0_0_10px_hsl(280_100%_65%/0.15)] transition-all">
              <UserCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="font-[Orbitron] font-semibold text-foreground block text-sm uppercase tracking-wider">Perfil</span>
              <span className="text-sm text-muted-foreground">Estatísticas e configurações</span>
            </div>
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className="neon-card w-full flex items-center gap-4 p-5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover:border-primary/40 transition-all">
              <Info className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <span className="font-[Orbitron] font-semibold text-foreground block text-sm uppercase tracking-wider">Sobre o Jogo</span>
              <span className="text-sm text-muted-foreground">Créditos e informações</span>
            </div>
          </button>
        </div>

        {/* Footer credits */}
        <footer className="mt-10 text-xs text-muted-foreground">
          <p>
            By <span className="font-semibold text-foreground/70">Gabriel</span>{" "}
            <a
              href="https://instagram.com/gmbrx_"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-0.5"
            >
              <Instagram className="w-3 h-3" />
              (@gmbrx_)
            </a>
            {" "}/{" "}
            <span className="font-semibold text-foreground/70">IA Lux & Wise</span>
          </p>
        </footer>
        </div>
      </div>

      {/* About modal */}
      {showAbout && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.8)", padding: "1rem", backdropFilter: "blur(8px)" }}
          onClick={() => setShowAbout(false)}
        >
          <div
            className="neon-card"
            style={{ width: "100%", maxWidth: "420px", padding: "1.5rem", animation: "modal-enter 0.2s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[Orbitron] text-base font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-5 h-5 text-primary" /> Sobre o Jogo
              </h2>
              <button onClick={() => setShowAbout(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Jogo da Velha 2</span> é uma versão
                estratégica do clássico jogo da velha. Cada jogada determina em qual tabuleiro o adversário
                deve jogar, exigindo pensamento tático e planejamento.
              </p>
              <p>
                Este jogo foi criado inteiramente com auxílio de inteligência artificial, demonstrando o
                potencial da colaboração entre humanos e IA.
              </p>

              <div className="pt-3 border-t border-border space-y-2">
                <p className="font-[Orbitron] text-foreground font-semibold text-xs uppercase tracking-wider">Créditos</p>
                <p>Jogo criado por <span className="font-semibold text-foreground">IA Lux & Wise</span></p>
                <p>
                  Idealizado por{" "}
                  <a
                    href="https://instagram.com/gmbrx_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Gabriel (@gmbrx_)
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
