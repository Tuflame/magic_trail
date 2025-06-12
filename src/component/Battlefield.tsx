import React from "react";
import type { Monster } from "../hook/GameLogic";
import MonsterCard from "./MonsterCard";

type BattlefieldProps = {
  monsters: Monster[];
};

export function Battlefield({ monsters}: BattlefieldProps) {

  return (
    <div className="battlefield">
      <div className="section-header">
        <h2 className="section-title">戰場區域</h2>
      </div>
      <div className="battlefield-grid">
        {monsters.map((monster, idx) =>
            monster ? (
              <MonsterCard key={idx} monster={monster} />
            ) : (
              <div key={idx} className="monster-slot empty">（空）</div>
            )
)}
      </div>
    </div>
  );
}
