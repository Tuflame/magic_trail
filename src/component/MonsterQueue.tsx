import "./MonsterQueue.css"
import type { Monster } from "../hook/GameLogic";
import MonsterCard from "./MonsterCard";

export function MonsterQueue({ monsters }: { monsters: Monster[] }) {
  // 取得第 4~6 隻怪物
  return (
    <div className="monsterqueue-grid">
        <div className="section-header">
          <h2 className="section-title">列隊區域</h2>
        </div>
        <div className="MonsterQueue-rowContainer">
            {monsters.map((monster, index) => (
            <MonsterCard key={index} monster={monster} />
            ))}
        </div>
    </div>
  );
}