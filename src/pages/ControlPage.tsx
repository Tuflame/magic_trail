import { useState } from "react";
import type { Player } from "../hook/GameLogic";
import { Order } from "../component/Order";

import type { GameLogicType } from "../hook/GameLogic";

export default function ControlPage({ game }: { game: GameLogicType }) {
  const {
    players,
    generatePlayer,
    generateMonster,
    killMonsterAt,
    movePlayerToFront,
    rotatePlayers,
  } = game;

  const [id, setID] = useState(1);
  const plus = () => setID((prev) => prev + 1);

  const [name, setName] = useState("");

  return (
    <div className="control-page">
      <h1>🎛️ 控制面板</h1>
      <div className="section">
        <h2>👥 玩家控制</h2>
        <input type="text" placeholder="玩家名稱" value={name} onChange={(e) => setName(e.target.value)}/>
        <button
          onClick={() => {
            if (name.trim()) {
              generatePlayer(id, name.trim());
              plus();
              setName(""); // 清空欄位
            }
          }}>生成玩家</button>
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
