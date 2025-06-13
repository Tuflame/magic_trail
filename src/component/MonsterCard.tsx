import React from "react";
import type { Monster } from "../hook/GameLogic";

import "./MonsterCard.css"


type MonsterCardProps = {
  monster: Monster;
  size?: "small" | "normal";
};

export default function MonsterCard({ monster, size = "normal"  }: MonsterCardProps) {
  return (
    <div className={"monster-card " + (size === "small" ? "monster-card-small" : "")} data-type={monster.type.toLowerCase()}>
      <header className="monster-card-header">
        <span className="monster-type">{monster.type}</span>
        <span className="monster-health">❤️ {monster.HP} / {monster.maxHP}</span>
      </header>

      <div className="monster-card-body">
        <div className="monster-image">👾</div>
        <h3 className="monster-name">{monster.name}</h3>
      </div>

      <footer className="monster-card-footer">
        <div className="monster-loot">
          {monster.loot.gold > 0 && <div>💰 金幣：{monster.loot.gold}</div>}
          {monster.loot.manaStone > 0 && <div>🔷 魔能石：{monster.loot.manaStone}</div>}
          {monster.loot.spellCards && <div>🧪 法術卡：{monster.loot.spellCards}</div>}
        </div>
      </footer>
    </div>
  );
}
