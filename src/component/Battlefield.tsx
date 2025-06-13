import React from "react";
import type { Monster } from "../hook/GameLogic";
import MonsterCard from "./MonsterCard";
import "./Battlefield.css";

export function Battlefield({ monsters }: { monsters: Monster[] }) {
  return (
    <div className="battlefield">
      <div className="section-header">
        <h2 className="section-title">戰場區域</h2>
      </div>
      <div className="battlefield-rowContainer">
        {[...Array(3)].map((_, idx) => {
          const monster = monsters[idx]; // 有怪就用，沒怪就是 undefined
          return monster ? (
            <MonsterCard key={idx} monster={monster} />
          ) : (
            <div key={idx} className="monster-slot empty">（空）</div>
          );
        })}
      </div>
    </div>
  );
}
