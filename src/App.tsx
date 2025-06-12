import { useState } from "react";
import "./App.css";

import { useGameLogic } from "./hook/GameLogic";
import { Order } from "./component/Order";
import { Battlefield } from "./component/Battlefield";
import { MonsterQueue } from "./component/MonsterQueue";
import type { Player, Monster } from "./hook/GameLogic";

export default function GamePage() {
  const {
    generatePlayer,
    generateMonster,
    generateMultipleMonsters,
    clearMonsters,
  } = useGameLogic();

  const [players, setPlayers] = useState<Player[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [monsterCounter, setMonsterCounter] = useState(0);

  const handleGenerateMonster = () => {
    setMonsterCounter(n => n + 1);
    const newMonster = generateMonster();
    setMonsters(prev => [...prev, newMonster]);
  };

  const handleGeneratePlayer = () => {
    const newPlayers: Player[] = [];
    for (let i = 1; i <= 6; i++) {
      newPlayers.push(generatePlayer(i, "第" + i  + "組"));
    }

    setPlayers(prev => [...prev, ...newPlayers]);
  };

  const handleDefeat = () => {
    // 這裡可補寫擊敗怪物的邏輯
  };

  return (
    <div className="main-container">
      <div className="left-section">
        <Order players={players} />
        <h2>控制區</h2>
        <button onClick={handleGeneratePlayer}>生成玩家</button>
        <button onClick={handleGenerateMonster}>生成怪物</button>
      </div>

      <div className="right-section">
        <div className="battlefield-wrapper">
            <Battlefield monsters={monsters.slice(0, 3)} />
        </div>
        <div className="queue-wrapper">
            <MonsterQueue monsters={monsters.slice(3, 6)} />
        </div>
      </div>

    </div>
  );
}
