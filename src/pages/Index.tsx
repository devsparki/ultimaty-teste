import { useState } from "react";
import MainMenu from "@/components/MainMenu";
import GameBoard from "@/components/GameBoard";
import TimeSettingsComponent from "@/components/TimeSettings";
import { OnlineGameWrapper } from "@/components/OnlineGameBoard";

type Screen = "menu" | "local-settings" | "local" | "online";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [timeConfig, setTimeConfig] = useState({ totalSeconds: 300, increment: 0 });

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

  return <MainMenu onLocal={() => setScreen("local-settings")} onOnline={() => setScreen("online")} />;
};

export default Index;
