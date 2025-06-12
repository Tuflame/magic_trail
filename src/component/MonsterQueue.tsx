import React from "react";
import type { Monster } from "../hook/GameLogic";
import MonsterCard from "./MonsterCard";

//import "./MonsterQueue.css"

type MonsterQueueProps = {
  monsters: Monster[];
};

export function MonsterQueue({monsters}: MonsterQueueProps) {
  // 取得第 4~6 隻怪物

  return (
    <div className="monsterquque-grid">
        <div className="section-header">
          <h2 className="section-title">列隊區域</h2>
        </div>
        <div>
          {monsters.map((monster) => (
            <MonsterCard monster={monster} />
          ))}
        </div>
    </div>
  );
}
