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
  attackCard:Record<AttackCardType,number>
};

export type AttackCardType = "魔法棒" | "冰凍法術" | "爆裂法術" | "毒藥法術";
export type SpellCardType = "冰凍法術" | "爆裂法術" | "毒藥法術";


export type AttackAction = {
  playerId: number;
  battleFieldIndex: number; // 對應戰場中第幾隻怪物（0~2）
  cardType: AttackCardType;
  element?: ElementType; // 僅魔法棒需要
  power?: number; // 僅魔法棒需要（例如基礎攻擊力）
};

export type Monster = {
  maxHP: number;
  HP: number;
  name: string;
  type: ElementType;
  loot: {
    gold: number;
    manaStone: number;
    spellCards: SpellCardType|null;
  };
};

type GamePhase = "事件" | "準備" | "行動" | "結算";

const monsterNameTable: Record<ElementType, string[]> = {
  火: ["火史萊姆", "炙熱哥布林"],
  水: ["水史萊姆", "高冷哥布林"],
  木: ["草史萊姆", "野蠻哥布林"],
  無: ["骷髏", "鬼魂"],
};

export function useGameLogic(){
  /*========================================*/
  //回合
  const [turn, setTurn] = useState(1);
  const nextTurn = () => {
    setTurn((t) => t + 1);
  };
  /*========================================*/
  //階段
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
  /*========================================*/
  //怪獸
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

  const getRandomSpellCard = (): SpellCardType => {
    const cards: SpellCardType[] = ["冰凍法術", "爆裂法術","冰凍法術", "爆裂法術", "毒藥法術"];
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
  };
  // 生成單個怪獸
  const generateMonster = (): Monster => {
    const _maxHP = getRandomInt(5, 10);
    const _type = getRandomElementType(); 
    const _name = getRandomMonsterName(_type);

    let gold = 0;
    let manaStone = 0;
    let spellCards: SpellCardType | null = null;

    // 第一個戰利品（必定出現）
    if (Math.random() < 0.5) {
      gold += 1;
    } else {
      manaStone += 1;
    }

    // 第二個戰利品（50% 機率出現）
    if (Math.random() < 0.5) {
      if (Math.random() < 0.65) {
        gold += 1;
      } else {
        spellCards = getRandomSpellCard();
      }
    }

    const newMonster: Monster = {
      maxHP: _maxHP,
      HP: _maxHP,
      name: _name,
      type: _type,
      loot: {
        gold,
        manaStone,
        spellCards,
      },
    };

    // 更新整體 monsters 陣列
    const updatedMonsters = [...monsters, newMonster];
    setMonsters(updatedMonsters);

    // 切分成 battlefield / queue
    const battlefield = updatedMonsters.slice(0, 3);
    const queue = updatedMonsters.slice(3);
    setBattleFieldMonster(battlefield);
    setQueueMonster(queue);

    return newMonster;
  };

  const [battleFieldMonster,setBattleFieldMonster]=useState<Monster[]>([]);
  const [queueMonster,setQueueMonster]=useState<Monster[]>([]);

 const killMonsterAt = (index: number) => {
    const battlefield = [...battleFieldMonster];
    const queue = [...queueMonster];

    // 若沒有等待怪補上就什麼都不做
    if (!queue.length) return;

    // 替補新怪上來
    const newMonster = queue[0];
    battlefield[index] = newMonster;

    // 更新 queue：移除剛補上來的
    const updatedQueue = queue.slice(1);

    // 更新狀態
    setBattleFieldMonster(battlefield);
    setQueueMonster(updatedQueue);
    setMonsters([...battlefield, ...updatedQueue]); // 🧠 確保同步主 monsters 狀態
  };

  const [attackQueue, setAttackQueue] = useState<AttackAction[]>([]);

  const submitAttack = (action: AttackAction) => {
    setAttackQueue((prev) => [...prev, action]);
  };

  const weaknessMap: Record<ElementType, ElementType> = {
    火: "木",
    木: "水",
    水: "火",
    無: "無",
  };

  const elementCycle = (type:ElementType):ElementType => {
    switch (type){
      case "火":
        return "水"
      case "水":
        return "木"
      case "木":
        return "火"
      default:
        console.warn("elementCycle have something wrong")
        return "無"
    }
  };

  const elementCycleMap:Record<ElementType, ElementType> = {
    火: "木",
    木: "水",
    水: "火",
    無: "無",
  };

  const [players, setPlayers] = useState<Player[]>([]);
  

  const generatePlayer = (_id: number, _name: string): Player => {
    const newPlayer: Player = {
      id: _id,
      name: _name,
      attack: {
        火: 1,
        水: 1,
        木: 1,
      },
      manaStone: 2,
      gold: 0,
      attackCard: {
        魔法棒:1,
        冰凍法術: 0,
        爆裂法術: 0,
        毒藥法術: 0,
      },
    };
    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  };


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
    battleFieldMonster,
    queueMonster,
    generateMonster,
    clearMonsters,
    killMonsterAt
  };
}