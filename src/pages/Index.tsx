import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MainMenu from "@/components/MainMenu";
import GameBoard from "@/components/GameBoard";
import TimeSettingsComponent from "@/components/TimeSettings";
import { OnlineGameWrapper } from "@/components/OnlineGameBoard";
import AuthGate from "@/components/AuthGate";
import UserProfile from "@/components/UserProfile";

type Screen = "menu" | "local-settings" | "local" | "online" | "profile";

const Index = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>("menu");
  const [timeConfig, setTimeConfig] = useState({ totalSeconds: 300, increment: 0 });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="futuristic-bg" />
        <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  if (screen === "local-settings") {
    return (
      <TimeSettingsComponent
        onStart={(totalSeconds, increment) => {
          setTimeConfig({ totalSeconds, increment });
          setScreen("local");
        }}
        onBack={() => setScreen("menu")}
      />
    );
  }

  if (screen === "local") {
    return (
      <GameBoard
        onBack={() => setScreen("menu")}
        totalSeconds={timeConfig.totalSeconds}
        increment={timeConfig.increment}
      />
    );
  }

  if (screen === "online") {
    return <OnlineGameWrapper onBack={() => setScreen("menu")} />;
  }

  if (screen === "profile") {
    return <UserProfile onBack={() => setScreen("menu")} />;
  }

  return (
    <MainMenu
      onLocal={() => setScreen("local-settings")}
      onOnline={() => setScreen("online")}
      onProfile={() => setScreen("profile")}
    />
  );
};

export default Index;
