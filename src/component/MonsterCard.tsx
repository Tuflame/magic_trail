import React from "react";
import type { Monster } from "../hook/GameLogic";
//import "./MonsterCard.css";

type MonsterCardProps = {
  monster: Monster;
};

export default function MonsterCard({ monster }: MonsterCardProps) {

  return (
    <div className="monster-card" data-type={monster.type.toLowerCase()}>
      <div className="Header">
        <div className="monster-type">{monster.type}</div>
        <div className="monster-health">❤️{monster.HP}/{monster.maxHP}</div>
      </div>

      <div className="detail">
        <div className="monster-image">👾</div>
        <div className="monster-name">{monster.name}</div>
      </div>

      <div className="monster-skills">
        <div className="monster-loot">
          {monster.loot.gold > 0 && <div>💰 金幣：{monster.loot.gold}</div>}
          {monster.loot.manaStone > 0 && <div>🔷 魔能石：{monster.loot.manaStone}</div>}
          {monster.loot.spellCards && <div>🧪 法術卡：{monster.loot.spellCards}</div>}
        </div>
      </div>
    </div>
  );
}
