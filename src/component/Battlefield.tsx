import React from "react";
import type { Monster } from "../hook/GameLogic";
import MonsterCard from "./MonsterCard";
import "./Battlefield.css";


type BattlefieldProps = {
  monsters: Monster[];
};

export function Battlefield({ monsters }: BattlefieldProps) {

  return (
    <div className="battlefield">
      <div className="section-header">
        <h2 className="section-title">戰場區域</h2>
      </div>
      <div className="battlefield-rowContainer">
        {monsters.map((monster, index) => (
          <MonsterCard key={index} monster={monster} />
        ))}
      </div>
    </div>
  );
}
