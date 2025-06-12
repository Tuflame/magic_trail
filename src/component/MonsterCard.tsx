import React from "react";
import type { Monster } from "../hook/GameLogic";
//import "./MonsterCard.css";

type MonsterCardProps = {
  monster: Monster;
};

export default function MonsterCard({ monster }: MonsterCardProps) {

  return (
    <div className="monster-card" data-type={monster.type.toLowerCase()}>
      <div>{monster.type}</div>

      <div className="health-container">
        <div className="health-indicator">
          ❤️ {monster.maxHP}
        </div>
      </div>

      <div className="monster-image-container">
        <div className="monster-image">👾</div>
        <div className="monster-name">{monster.name}</div>
      </div>

      <div className="monster-skills">
        <div className="skill-container">💰 Gold: {monster.gold}</div>
        <div className="skill-container">🔮 Soul: {monster.soulCrystal}</div>
        <div className="skill-container">🏆 Score: {monster.score}</div>
      </div>
    </div>
  );
}
