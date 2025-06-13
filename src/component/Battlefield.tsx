import React from "react";
import type { BattleFieldSlot } from "../hook/GameLogic";
import MonsterCard from "./MonsterCard";
import "./Battlefield.css";

export function Battlefield({ monsters }: { monsters: BattleFieldSlot[] }) {
  return (
    <div className="battlefield">
      <div className="section-header">
        <h2 className="section-title">戰場區域</h2>
      </div>
      <div className="battlefield-rowContainer">
        {monsters.map((slot, idx) =>
          slot ? (
            <MonsterCard key={idx} monster={slot.moster} />
          ) : (
            <div key={idx} className="monster-slot empty">（空）</div>
          )
        )}
      </div>
    </div>
  );
}