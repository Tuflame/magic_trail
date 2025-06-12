import { useState } from "react";

export type ElementType = "火" | "水" | "木" | "無";

export type Player = {
  id: number;
  name: string;
  attack:{
    火: number;
    水: number;
    木: number;
  },
  manaStone: number;
  gold: number;
  soulCrystal: number;
  scorecredit:number;
};

export type AttackCardType =  "魔法棒" | "冰凍法術" | "爆裂法術" | "毒藥法術";

export type AttackAction = {
  playerId: number;
  targetIndex: number; // 對應戰場中第幾隻怪物（0~2）
  element?: ElementType; // 僅武器與魔法棒需要
  cardType: AttackCardType;
  power?: number; // 僅武器/魔法棒需要（例如基礎攻擊力）
};


export type Monster = {
  maxHP: number;
  HP: number;
  name: string;
  type: ElementType;
  manaStone: number;
  gold: number;
  soulCrystal: number;
  score: number;

};

type GamePhase = "事件" | "準備" | "行動" | "結算";

const monsterNameTable: Record<ElementType, string[]> = {
  火: ["火史萊姆", "炙熱哥布林"],
  水: ["水史萊姆", "高冷哥布林"],
  木: ["草史萊姆", "野蠻哥布林"],
  無: ["骷髏", "鬼魂"],
};

// const Goblin:Record<ElementType, string[]> = {
//   火: ["炙熱哥布林"],
//   水: ["高冷哥布林"],
//   木: ["野蠻哥布林"],
//   無: ["陰森哥布林"],
// };

export function useGameLogic(){
  const [turn, setTurn] = useState(1);

  const nextTurn = () => {
    setTurn((t) => t + 1);
  };

  const [phase, setPhase] = useState<GamePhase>("事件");

  const advancePhase = () => {
    setPhase((prev) => {
      switch (prev) {
        case "事件":
          return "準備";
        case "準備":
          return "行動";
        case "行動":
          return "結算";
        case "結算":
          nextTurn(); // 回合加1
          return "事件"; // 新回合重新開始
      }
    });
  };

  const weaknessMap: Record<ElementType, ElementType> = {
    火: "木",
    木: "水",
    水: "火",
    無: "無",
  };

  const [players, setPlayers] = useState<Player[]>([]);
  // 管理怪獸陣列的狀態
  const [monsters, setMonsters] = useState<Monster[]>([]);

  // 隨機生成數字的輔助函式
  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };


  // 隨機選擇 屬性 的輔助函式
  const getRandomElementType = (): ElementType => {
    const weighted: ElementType[] = ["火", "火", "火", "水", "水", "水", "木", "木", "木", "無"];
    const idx = Math.floor(Math.random() * weighted.length);
    return weighted[idx];
  };

  //隨機選擇 怪物名稱 的輔助函式
  const getRandomMonsterName = (type: ElementType): string => {
    const names = monsterNameTable[type];
    const idx = Math.floor(Math.random() * names.length);
    return names[idx];
  };

  // 生成單個怪獸
  const generateMonster = (): Monster => {
    const _maxHP=getRandomInt(5, 10);
    const _type = getRandomElementType(); 
    const _name=getRandomMonsterName(_type);

    const newMonster: Monster = {
      maxHP: _maxHP,
      HP: _maxHP,
      name: _name,
      type: _type,
      manaStone: getRandomInt(0, 2),
      gold: getRandomInt(0, 2),
      soulCrystal: 0,
      score: getRandomInt(1,3),
      poisoned: false,
    };
    setMonsters((prev) => [...prev, newMonster]);
    return newMonster;
  };

  // 生成多個怪獸
  const generateMultipleMonsters = (count: number): Monster[] => {
    const newMonsters: Monster[] = [];
    for (let i = 0; i < count; i++) {
      const monster = generateMonster();
      newMonsters.push(monster);
    }
    return newMonsters;
  };

  const generatePlayer=(_id:number,_name:string):Player=>{
    const newPlayer:Player={
      id: _id,
    name: _name,
    attack: {
      火: 1,
      水: 1,
      木: 1
    },
    manaStone: 2,
    gold: 0,
    soulCrystal: 0,
    scorecredit:0,
    }
    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  }

  // 清空怪獸陣列
  const clearMonsters = (): void => {
    setMonsters([]);
  };

  // 回傳 Hook 提供的狀態和函式
  return {
    turn,
    nextTurn,
    players,
    generatePlayer,
    monsters,
    generateMonster,
    generateMultipleMonsters,
    clearMonsters,
  };
}