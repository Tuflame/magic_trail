import { useState ,useEffect ,useRef} from "react";

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
  effects?: EventEffect | EventEffect[];
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
    effects: {
      description: "所有玩家 +1 魔能石",
      applyEffect: () => {
        console.log("🌟 所有玩家魔能石 +1");
        // 可設計 setPlayers(p => ...) 加值處理
      },
    },
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
    effects: {
      description: "生成 3 隻哥布林進入列隊",
      applyEffect: () => {
        console.log("🗡️ 生成哥布林 x3");
        // 你可以呼叫 generateMonster("木", "野蠻哥布林", 3) 這類方法
      },
    },
  },
  {
    name: "掏金熱",
    description: "本回合擊殺怪物獲得雙倍金幣。",
    effects: {
      description: "擊殺怪物金幣 x2",
      applyEffect: () => {
        console.log("💰 本回合擊殺金幣加倍！");
        // 可設 flag，結算階段時金幣 *2
      },
    },
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

export type BattleFieldMonster={
  moster:Monster;
  poisonedBy: number[]|null;
  lastIcedBy:number|null;
}

export type BattleFieldSlot = BattleFieldMonster | null;

const monsterNameTable: Record<ElementType, string[]> = {
  火: ["火史萊姆", "炙熱哥布林","火精靈"],
  水: ["水史萊姆", "高冷哥布林"],
  木: ["草史萊姆", "野蠻哥布林","Bur Bur Patapim"],
  無: ["骷髏", "鬼魂"],
};

const elementCounterMap: Record<ElementType, ElementType> = {
  火: "木",
  木: "水",
  水: "火",
  無: "無",
};

const elementWeaknessMap: Record<ElementType, ElementType> = {
  火: "水",
  水: "木",
  木: "火",
  無: "無",
};

export function useGameLogic(){
  /*========================================*/
  //回合
  const [turn, setTurn] = useState(1);
const [phase, setPhase] = useState<GamePhase>("事件");
const previousPhaseRef = useRef<GamePhase>("結算");

// 階段推進副作用（不含 nextTurn）
useEffect(() => {
  if (phase === "事件") {
    triggerRandomEvent();
  } else if (phase === "行動") {
    executeActionPhase();
  }

  // 檢查是否從「結算」切到「事件」，若是才加回合
  if (previousPhaseRef.current === "結算" && phase === "事件") {
    setTurn((t) => t + 1);
  }

  previousPhaseRef.current = phase;
}, [phase]);

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
        return "事件";
    }
  });
};


  /*========================================*/
  //怪獸
  const [battleFieldMonsters, setBattleFieldMonsters] = 
    useState<[BattleFieldMonster | null, BattleFieldMonster | null, BattleFieldMonster | null]>([null, null, null]);
  const [queueMonsters, setQueueMonsters] = useState<Monster[]>([]);
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
  const generateMonster = () => {
    const _maxHP = getRandomInt(5, 10);
    const _type = getRandomElementType(); 
    const _name = getRandomMonsterName(_type);

    let gold = 0;
    let manaStone = 0;
    let spellCards: SpellCardType | null = null;

    // 第一個戰利品（必定出現）
    if (Math.random() < 0.6) {
      gold += 1;
    } else {
      manaStone += 1;
    }

    // 第二個戰利品（50% 機率出現）
    if (Math.random() < 0.5) {
      if (Math.random() < 0.4) {
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

    setQueueMonsters((prevQueue) => {
      return [...prevQueue, newMonster];
    });
  };

    const fillBattlefieldFromQueue = () => {

      const updatedBattlefield = [...battleFieldMonsters];
      const updatedQueue = [...queueMonsters];

      const emptyIndex = battleFieldMonsters.findIndex(m => m === null);
      if (emptyIndex !== -1 && updatedQueue.length > 0) {
        const wrappedMonster: BattleFieldMonster = {
          moster: updatedQueue[0],
          poisonedBy: null,
          lastIcedBy: null,
        };
        updatedBattlefield[emptyIndex] = wrappedMonster;
        setBattleFieldMonsters(updatedBattlefield as typeof battleFieldMonsters);
        updatedQueue.shift();
        setQueueMonsters(updatedQueue);
      }
    };

    useEffect(() => {
      fillBattlefieldFromQueue();
    }, [queueMonsters]);

    const executeActionPhase = () => {
      const newBattlefield = [...battleFieldMonsters];
      const updatedPlayers = [...players];

      for (const action of attackQueue) {
        const copyplayer = updatedPlayers.find(p => p.id === action.playerId);
        //理論上不會出現這個狀況，單純防禦
        if (!copyplayer) continue;
        // ===== 毒藥傷害處理（每次攻擊前） =====
        for (let i = 0; i < newBattlefield.length; i++) {
          const slot = newBattlefield[i];
          //如果沒有被毒或是已經被冰凍則跳過
          if (!slot || !slot.poisonedBy||slot.lastIcedBy) continue;
          for (const poisonerId of slot.poisonedBy) {
            const dmgPlayer = updatedPlayers.find(p => p.id === poisonerId);
            if (!dmgPlayer) continue;
            slot.moster.HP -= 1;
            if (slot.moster.HP <= 0) {
              // 發獎勵給最後毒死怪物者
              dmgPlayer.loot.gold += slot.moster.loot.gold;
              dmgPlayer.loot.manaStone += slot.moster.loot.manaStone;
              if (slot.moster.loot.spellCards) {
                dmgPlayer.loot.spellCards[slot.moster.loot.spellCards]++;
              }
              newBattlefield[i] = null;
              setBattleFieldMonsters(newBattlefield as [BattleFieldMonster | null, BattleFieldMonster | null, BattleFieldMonster | null]);
              break; // 怪物已死亡，跳出毒傷結算
            }
          }
        }

        // ===== 正常攻擊處理 =====
        const slot = newBattlefield[action.battleFieldIndex];
        if(!slot) return;

        // 如果該戰場是行動玩家先前冰的，則冰凍先解除
        if (slot.lastIcedBy && slot.lastIcedBy === copyplayer.id) {
          slot.lastIcedBy = null;
        }
        //如果戰場被冰了，則跳過攻擊
        if(slot.lastIcedBy) continue;      

        // 攻擊處理
        if (action.cardType === "魔法棒") {
          const power = action.power;
          const element = action.element;
          if (!element||!power) continue;

          let dmg = power;
          if(elementCounterMap[element]==slot.moster.type){
            dmg*=2;
          }
          else if(elementWeaknessMap[element]==slot.moster.type){
            dmg*=0;
          }
          slot.moster.HP -= dmg;
        }
        else if (action.cardType === "冰凍法術") {
          slot.lastIcedBy = copyplayer.id;
        }
        else if (action.cardType === "爆裂法術") {
          for (const m of newBattlefield) {
            if (m) m.moster.HP -= 2;
          }
        }
        else if (action.cardType === "毒藥法術") {
          if (!slot.poisonedBy) slot.poisonedBy = [];
          slot.poisonedBy.push(copyplayer.id);
        }

        // ===== 怪物死亡檢查 =====
        if (slot && slot.moster.HP <= 0) {
          copyplayer.loot.gold += slot.moster.loot.gold;
          copyplayer.loot.manaStone += slot.moster.loot.manaStone;
          if (slot.moster.loot.spellCards) {
            copyplayer.loot.spellCards[slot.moster.loot.spellCards]++;
          }
          newBattlefield[action.battleFieldIndex] = null;
          setBattleFieldMonsters(newBattlefield as [BattleFieldMonster | null, BattleFieldMonster | null, BattleFieldMonster | null]);
          setPlayers(updatedPlayers);
        }
      }
      setAttackQueue([]);
    };
  const [attackQueue, setAttackQueue] = useState<AttackAction[]>([]);

  const submitAttack = (action: AttackAction) => {
  setAttackQueue((prevQueue) => {
    const playerIndex = players.findIndex(p => p.id === action.playerId);
    if (playerIndex === -1) return prevQueue; // 玩家不存在則不變動

    const newQueue = [...prevQueue];
    newQueue.splice(playerIndex, 0, action); // 插入至對應 index 位置
    return newQueue;
  });
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
  const movePlayerIndexToFront = (index: number) => {
    index-=1;
    setPlayers(prev => {
      if (index <= 0 || index >= prev.length) return [...prev]; // 無需移動或 index 無效

      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);

      return [target, ...rest];
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

  let appliedEffect: EventEffect | undefined;

  // 根據 effect 的型別來決定怎麼處理
  if (Array.isArray(selected.effects)) {
    const randomEffectIndex = Math.floor(Math.random() * selected.effects.length);
    appliedEffect = selected.effects[randomEffectIndex];
  } else if (selected.effects) {
    appliedEffect = selected.effects;
  }

  if (appliedEffect) {
    appliedEffect.applyEffect?.();

    const appliedEvent: GameEvent = {
      ...selected,
      description: appliedEffect.description, // 使用實際效果的描述
      effects: appliedEffect, // 也可保留選中的 effect 作為記錄
    };

    setEvent(appliedEvent);
  } else {
    // 沒有 effects 的情況
    setEvent(selected);
  }
};
  // 回傳 Hook 提供的狀態和函式
  return {
    turn,
    players,
    generatePlayer,
    battleFieldMonster: battleFieldMonsters,
    queueMonster: queueMonsters,
    generateMonster,
    submitAttack,
    advancePhase,
    phase,
    executeActionPhase,
    movePlayerIndexToFront,
    rotatePlayers,
    event,
    triggerRandomEvent
  };
}

export type GameLogicType = ReturnType<typeof useGameLogic>;
