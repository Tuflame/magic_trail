import { useState } from "react";

export type ElementType = "火" | "水" | "木" | "無";

export type SpellCardType = "冰凍法術" | "爆裂法術" | "毒藥法術";
export type AttackCardType = "魔法棒" | SpellCardType
export type GamePhase = "事件" | "準備" | "行動" | "結算";

export type EventEffect = {
  description: string;
  applyEffect: () => void; // 之後可傳入 context 做出真實影響
};

export type GameEvent = {
  name: string;
  description: string;
  effects?: EventEffect[];
};

// 主事件表
const eventTable: GameEvent[] = [
  {
    name: "無事件",
    description: "本回合風平浪靜，什麼也沒發生。",
  },
  {
    name: "旅行商人",
    description: "出現旅行商人，玩家可以花費金幣購買武器或道具。",
  },
  {
    name: "精靈的祝福",
    description: "精靈降臨，所有玩家獲得 +1 魔能石。",
    effects: [
      {
        description: "所有玩家 +1 魔能石",
        applyEffect: () => {
          console.log("🌟 所有玩家魔能石 +1");
          // 可設計 setPlayers(p => ...) 加值處理
        },
      },
    ],
  },
  {
    name: "元素紊亂",
    description: "元素能量混亂，以下隨機一種效果生效：",
    effects: [
      {
        description: "元素剋制關係失效",
        applyEffect: () => {
          console.log("⚡ 剋制關係失效，本回合不計屬性差異");
        },
      },
      {
        description: "所有攻擊視為無屬性",
        applyEffect: () => {
          console.log("⚡ 所有攻擊為無屬性攻擊");
        },
      },
      {
        description: "怪物屬性混亂（隨機洗牌）",
        applyEffect: () => {
          console.log("⚡ 所有怪物屬性重新分配");
        },
      },
    ],
  },
  {
    name: "哥布林襲擊",
    description: "3隻哥布林衝入列隊，血量3，擊殺可得 1 金幣。",
    effects: [
      {
        description: "生成 3 隻哥布林進入列隊",
        applyEffect: () => {
          console.log("🗡️ 生成哥布林 x3");
          // 你可以呼叫 generateMonster("木", "野蠻哥布林", 3) 這類方法
        },
      },
    ],
  },
  {
    name: "掏金熱",
    description: "本回合擊殺怪物獲得雙倍金幣。",
    effects: [
      {
        description: "擊殺怪物金幣 x2",
        applyEffect: () => {
          console.log("💰 本回合擊殺金幣加倍！");
          // 可設 flag，結算階段時金幣 *2
        },
      },
    ],
  },
];

export type Player = {
  id: number;
  name: string;
  attack:{
    火: number;
    水: number;
    木: number;
  },
  loot: {
      gold: number;
      manaStone: number;
      spellCards:Record<AttackCardType,number>
  };
};

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

const monsterNameTable: Record<ElementType, string[]> = {
  火: ["火史萊姆", "炙熱哥布林","火焰蜥蜴"],
  水: ["水史萊姆", "高冷哥布林"],
  木: ["草史萊姆", "野蠻哥布林","Bur Bur Patapim"],
  無: ["骷髏", "鬼魂"],
};

const weaknessMap: Record<ElementType, ElementType> = {
    火: "木",
    木: "水",
    水: "火",
    無: "無",
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
    const weighted: ElementType[] = ["火", "火",  "水", "水",  "木",  "木", "無"];
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

    if (queue.length > 0) {
      const newMonster = queue.shift()!;
      battlefield[index] = newMonster;
      setQueueMonster(queue);
    } else {
      // 沒怪可補，該位置清空
      battlefield[index] = undefined as unknown as Monster;
    }

    setBattleFieldMonster(battlefield);
    setMonsters([...battlefield.filter(Boolean), ...queue]);
  };


  const [attackQueue, setAttackQueue] = useState<AttackAction[]>([]);

  const submitAttack = (action: AttackAction) => {
    setAttackQueue((prev) => [...prev, action]);
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
  /*========================================*/
  //玩家區
  const [players, setPlayers] = useState<Player[]>([]);
  //生成玩家
  const generatePlayer = (_id: number, _name: string): Player => {
    const newPlayer: Player = {
      id: _id,
      name: _name,
      attack: {
        火: 1,
        水: 1,
        木: 1,
      },
      loot:{
        gold: 0,
        manaStone: 2,
        spellCards:{
          魔法棒:1,
          冰凍法術: 0,
          爆裂法術: 0,
          毒藥法術: 0,
        }
      }
    };
    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  };
  //順序調動卡
  const movePlayerToFront = (playerId: number) => {
    setPlayers(prev => {
      const rest = prev.filter(p => p.id !== playerId);
      const target = prev.find(p => p.id === playerId);
      return target ? [target, ...rest] : prev;
    });
  };
  //順序輪轉
  const rotatePlayers = () => {
    setPlayers(prev => {
      if (prev.length <= 1) return prev;
      return [...prev.slice(1), prev[0]];
    });
  };
  /*========================================*/
  //事件區
  const [event,setEvent]=useState<GameEvent>();
  //隨機事件
  const triggerRandomEvent = () => {
    const randomIndex = Math.floor(Math.random() * eventTable.length);
    const selected = eventTable[randomIndex];

    // 如果事件有多個效果，從中抽一個
    if (selected.effects && selected.effects.length > 0) {
      const randomEffectIndex = Math.floor(Math.random() * selected.effects.length);
      const chosenEffect = selected.effects[randomEffectIndex];

      // 建立新事件物件，描述為實際選到的效果內容
      const appliedEvent: GameEvent = {
        ...selected,
        description: chosenEffect.description,
      };

      chosenEffect.applyEffect?.();
      setEvent(appliedEvent);
    } else {
      setEvent(selected);
    }
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
    killMonsterAt,
    movePlayerToFront,
    rotatePlayers,
    event,
    triggerRandomEvent
  };
}