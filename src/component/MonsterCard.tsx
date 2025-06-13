import React from "react";
import type { Monster, SpellCardType } from "../hook/GameLogic";

import "./MonsterCard.css"


type MonsterCardProps = {
  monster: Monster;
  size?: "small" | "normal";
};

export default function MonsterCard({monster}: MonsterCardProps) {
  return (
    <div className={"monster-card"} data-type={monster.type.toLowerCase()}>
      <header className="monster-card-header">
        <span className="monster-type">{monster.type}</span>
        <span className="monster-health">❤️ {monster.HP} / {monster.maxHP}</span>
      </header>

      <div className="monster-card-body">
        <div className="monster-image">👾</div>
        <h3 className="monster-name">{monster.name}</h3>
      </div>

      <footer className="monster-card-footer">
        {lootContainer(monster.loot)}
      </footer>
    </div>
  );
}


function lootContainer(loot:Monster["loot"]){
  const lootItems = [];

  if(loot.gold > 0){
    lootItems.push(<LootItem key="gold" type="gold" value={loot.gold} />);
  }
  if(loot.manaStone > 0){
    lootItems.push(<LootItem key="manaStone" type="manaStone" value={loot.manaStone} />);
  }
  if(loot.spellCards !== null){
    lootItems.push(<LootItem key="spellCards" type="spellCards" value={loot.spellCards} />);
  }

  return (
    <div
      className="lootContainer"
      style={{
        display: "flex",
        gap: "8px",
        justifyContent: "space-evenly",
        width: "100%",
      }}
    >
      {lootItems}
    </div>
  );
}

function LootItem({ type, value }: { type: string; value: number | string }) {
  const lootConfig = {
    gold: { icon: "/src/assets/gold.png", label: "" },
    manaStone: { icon: "/src/assets/manaStone.png", label: "" },
    spellCards: { icon: "/src/assets/spellCards.png", label: "" }
  };

  const spellCardIcons: Record<SpellCardType, string> = {
    "冰凍法術": "/src/assets/spell/spell_ice.png",
    "爆裂法術": "/src/assets/spell/spell_boom.png", 
    "毒藥法術": "/src/assets/spell/spell_poison.png"
  };
  
  const config = lootConfig[type as keyof typeof lootConfig];
  if (!config) return null;

  // 如果是法術卡，使用對應的法術圖示
  const iconSrc = type === "spellCards" && typeof value === "string" 
    ? spellCardIcons[value as SpellCardType]
    : config.icon;

  // 根據 value 的數值重複顯示圖示
  const items = [];
  const count = typeof value === 'number' ? value : 1;
  
  for (let i = 0; i < count; i++) {
    items.push(
      <img 
        key={i}
        src={iconSrc} 
        alt={config.label} 
        style={{ width: "32px", height: "32px" }} 
      />
    );
  }

  return <div className="LootItem" style={{ display: "flex", gap: "4px" }}>{items}</div>;
}


