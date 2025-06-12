import { useState } from "react";
import { useGameLogic } from "./hook/GameLogic";
import type { Player } from "./hook/GameLogic";
import { Order } from "./component/Order";

export default function ControlPage() {
  const {
    players,
    generatePlayer,
    generateMonster,
    killMonsterAt,
    movePlayerToFront,
    rotatePlayers,
  } = useGameLogic();

  const [id, setID] = useState(1);

  const plus = () => setID((prev) => prev + 1);

  return (
    <div className="control-page">
      <h1>🎛️ 控制面板</h1>
      <div className="section">
        <h2>👥 玩家控制</h2>
        <button onClick={() => { generatePlayer(id, `玩家${id}`); plus(); }}>
          生成玩家
        </button>
        <button onClick={() => movePlayerToFront(3)}>將第3往前調動</button>
        <button onClick={rotatePlayers}>玩家順序輪轉</button>
      </div>
      <div className="section">
        <h2>👾 怪物控制</h2>
        <button onClick={generateMonster}>生成怪物</button>
        <button onClick={() => killMonsterAt(0)}>🗡️ 擊殺第1隻怪物</button>
        <button onClick={() => killMonsterAt(1)}>🗡️ 擊殺第2隻怪物</button>
        <button onClick={() => killMonsterAt(2)}>🗡️ 擊殺第3隻怪物</button>
      </div>
    </div>
  );
}
