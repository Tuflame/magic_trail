import { useState ,useEffect ,useRef} from "react";

export type ElementType = "火" | "水" | "木" | "無";
export type SpellCardType = "冰凍法術" | "爆裂法術" | "毒藥法術";
export type AttackCardType = "魔法棒" | SpellCardType
export type GamePhase = "事件" | "準備" | "行動" | "結算";

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
  imageUrl?:string; 
};

export type BattleFieldMonster={
  index:number;
  moster:Monster;
  poisonedBy: number[]|null;
  lastIcedBy:number|null;
}

export type BattleFieldSlot = BattleFieldMonster | null;

export type BattleLog = {
  turn: number;
  message: string;
};

export type EventEffect = {
  description: string;
  weighted?:number;
  applyEffect: () => void;
};

export type GameEvent = {
  name: string;
  description: string;
  weighted:number;
  effects?: EventEffect | EventEffect[];
};


export type AttackAction = {
  playerId: number;
  battleFieldIndex: 0 | 1 | 2;
  cardType: AttackCardType;
  element?: ElementType; // 僅魔法棒需要
  power?: number; // 僅魔法棒需要（例如基礎攻擊力）
};

export function useGameLogic(){
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      for (let i = 0; i < 6; i++) {
        generateMonster();
      }
      fillBattlefieldFromQueue();
    }
  }, []);
  /*========================================*/
  //回合
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("事件");
  const previousPhaseRef = useRef<GamePhase|"">("");

  // 階段推進副作用（不含 nextTurn）
  useEffect(() => {
    if (phase === "事件") {
      triggerEvent();
    } else if (phase === "結算") {
      executeActionPhase();
    }

    // 檢查是否從「結算」切到「事件」，若是才加回合
    if (previousPhaseRef.current === "結算" && phase === "事件") {
      setTurn((t) => t + 1);
      rotatePlayers();
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

  const [logs, setLogs] = useState<BattleLog[]>([]);

  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      console.log(`第 ${lastLog.turn} 回合: ${lastLog.message}`);
    }
  }, [logs]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      { turn, message },
      ...prev,
    ]);
  };

  /*========================================*/
  //怪獸
  const [battleFieldMonsters, setBattleFieldMonsters] = 
    useState<[BattleFieldMonster | null, BattleFieldMonster | null, BattleFieldMonster | null]>([null, null, null]);
  const [queueMonsters, setQueueMonsters] = useState<Monster[]>([]);
  const monsterNameTable: Record<ElementType, string[]> = {
    火: ["火史萊姆"],
    水: ["水史萊姆"],
    木: ["草史萊姆"],
    無: ["骷髏", "鬼魂"],
  };
  const Goblin:Monster[]=[
    {
      maxHP: 5,
      HP: 5,
      name: "炙熱哥布林",
      type: "火",
      loot: {
        gold: 2,
        manaStone: 0,
        spellCards: null,
      },
    },
    {
      maxHP: 5,
      HP: 5,
      name: "冰冷哥布林",
      type: "水",
      loot: {
        gold: 2,
        manaStone: 0,
        spellCards: null,
      },
    },
    {
      maxHP: 5,
      HP: 5,
      name: "狂野哥布林",
      type: "木",
      loot: {
        gold: 2,
        manaStone: 0,
        spellCards: null,
      },
    },
  ];
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
    if (Math.random() < 1) {
      if (Math.random() < 0.1) {
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
          index:emptyIndex,
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
    }, [battleFieldMonsters,queueMonsters]);
    //攻擊相關
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

    const executeActionPhase = () => {
      const newBattlefield = [...battleFieldMonsters];
      const updatedPlayers = [...players];

      for (const action of attackQueue) {
        const currentPlayer = updatedPlayers.find(p => p.id === action.playerId);
        //理論上不會出現這個狀況，單純防禦
        if (!currentPlayer) continue;
        // ===== 毒藥傷害處理（每次攻擊前） =====
        for (let i = 0; i < newBattlefield.length; i++) {
          const slot = newBattlefield[i];
          //如果沒有被毒或是已經被冰凍則跳過
          if (!slot) continue;
          if (!slot || !slot.poisonedBy||slot.lastIcedBy) continue;
          for (const poisonerId of slot.poisonedBy) {
            const dmgPlayer = updatedPlayers.find(p => p.id === poisonerId);
            if (!dmgPlayer) continue;
            slot.moster.HP -= 1;
            console.log(`${dmgPlayer.name}的毒發作，對戰場怪物${slot.moster.name}造成1點傷害`);
            if (slot.moster.HP <= 0) {
              // 發獎勵給最後毒死怪物者
              dmgPlayer.loot.gold += slot.moster.loot.gold;
              dmgPlayer.loot.manaStone += slot.moster.loot.manaStone;
              if (slot.moster.loot.spellCards) {
                dmgPlayer.loot.spellCards[slot.moster.loot.spellCards]++;
              }
              console.log(`玩家${dmgPlayer.name} 毒殺了${slot.moster.name}`)
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
        if (slot.lastIcedBy && slot.lastIcedBy === currentPlayer.id) {
          console.log(`先前玩家${currentPlayer.name}對${slot.moster.name}的冰凍已解除`)
          slot.lastIcedBy = null;
        }
        //如果戰場被冰了，則跳過攻擊
        if(slot.lastIcedBy) {
          console.log(`玩家${currentPlayer.name}對${slot.moster.name}攻擊因冰凍而失效`)
          continue;
        } 

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
          console.log(`玩家${currentPlayer.id} 對${slot.moster.name}造成${dmg}點傷害`)
          slot.moster.HP -= dmg;
        }
        else if (action.cardType === "冰凍法術") {
          slot.lastIcedBy = currentPlayer.id;
          slot.moster.HP-=2;
          console.log(`玩家${currentPlayer.id} 對${slot.moster.name}造成2點傷害`)
        }
        else if (action.cardType === "爆裂法術") {
          for (const m of newBattlefield) {
            if (m) m.moster.HP -= 2;
          }
          console.log(`玩家${currentPlayer.id} 對所有戰場造成2點傷害`)
        }
        else if (action.cardType === "毒藥法術") {
          if (!slot.poisonedBy) slot.poisonedBy = [];
          slot.poisonedBy.push(currentPlayer.id);
          console.log(`玩家${currentPlayer.id} 對${slot.moster.name}投下毒藥`)
        }

        // ===== 怪物死亡檢查 =====
        if (slot && slot.moster.HP <= 0) {
          currentPlayer.loot.gold += slot.moster.loot.gold;
          currentPlayer.loot.manaStone += slot.moster.loot.manaStone;
          if (slot.moster.loot.spellCards) {
            currentPlayer.loot.spellCards[slot.moster.loot.spellCards]++;
          }
          console.log(`玩家${currentPlayer.id} 擊殺了${slot.moster.name}`)
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
  const generatePlayers = (amount: number=6) => {
    const players:Player[]=[];
    for(let i=1;i<=amount;i++){
      players.push({
        id: i,
        name: `玩家${i}`,
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
      });
    }
    setPlayers(players);
  };
  const changePlayerField=(
    playerId: number,
    path: (string | number)[],
    value: any
    ) => {
    setPlayers(ps =>
      ps.map(p => {
        if (p.id !== playerId) return p;
        // 巢狀複製
        let updated: any = { ...p };
        let obj = updated;
        for (let i = 0; i < path.length - 1; i++) {
          obj[path[i]] = { ...obj[path[i]] }; // 只複製路徑上的每一層
          obj = obj[path[i]];
        }
        obj[path[path.length - 1]] = value;
        return updated;
      })
    );
  }
  const changePlayerName = (id: number, name: string) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === id ? { ...player, name } : player
      )
    );
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
  //調整屬性
  /*========================================*/
  //事件區
  const [event,setEvent]=useState<GameEvent>();
  // 主事件表
  const eventTable: GameEvent[] = [
    {
      name: "無事件",
      description: "本回合風平浪靜，什麼也沒發生。",
      weighted:3,
      effects: {
        description: "本回合風平浪靜，什麼也沒發生。",
        applyEffect: () => {
          console.log("本回合風平浪靜，什麼也沒發生。");
          // 可設計 setPlayers(p => ...) 加值處理
        },
      },
    },
    {
      name: "旅行商人",
      description: "出現旅行商人，玩家可以花費金幣購買武器。",
      weighted:1,
      effects: {
        description: "出現旅行商人，玩家可以花費金幣購買武器。",
        applyEffect: () => {
          console.log("出現旅行商人，玩家可以花費金幣購買武器。");
          // 可設計 setPlayers(p => ...) 加值處理
        },
      },
    },
    {
      name: "精靈的祝福",
      description: "精靈降臨，所有玩家獲得 +1 魔能石。",
      weighted:1,
      effects: {
        description: "所有玩家 +1 魔能石",
        applyEffect: () => {
          console.log("🌟 所有玩家魔能石 +1");
          setPlayers((prev) =>
            prev.map((p) => ({
              ...p,
              loot: {
                ...p.loot,
                manaStone: p.loot.manaStone + 1,
              },
            }))
          );
        },
      },
    },
    {
      name: "元素紊亂",
      description: "元素能量混亂，以下隨機一種效果生效：",
      weighted:3,
      effects: [
        {
          description: "所有攻擊視為無屬性",
          weighted:1,
          applyEffect: () => {
            console.log("⚡ 所有攻擊為無屬性攻擊");
          },
        },
        {
          description: "火屬性傷害無效",
          weighted:1,
          applyEffect: () => {
            console.log("⚡ 火屬性傷害無效");
          },
        },
        {
          description: "水屬性傷害無效",
          weighted:1,
          applyEffect: () => {
            console.log("⚡ 水屬性傷害無效");
          },
        },
        {
          description: "木屬性傷害無效",
          weighted:1,
          applyEffect: () => {
            console.log("⚡ 木屬性傷害無效");
          },
        },
      ],
    },
    {
      name: "哥布林襲擊",
      description: "3隻哥布林衝入列隊，血量3，擊殺可得 2 金幣。",
      weighted:1,
      effects: {
        description: "生成 3 隻哥布林進入列隊",
        applyEffect: () => {
          console.log("🗡️ 生成哥布林 x3");
          setQueueMonsters((prev) => [...Goblin,...prev]);
        },
      },
    },
    {
      name: "掏金熱",
      description: "本回合擊殺怪物獲得雙倍金幣。",
      weighted:1,
      effects: {
        description: "擊殺怪物金幣 x2",
        applyEffect: () => {
          console.log("💰 本回合擊殺金幣加倍！");
          // 可設 flag，結算階段時金幣 *2
        },
      },
    },
  ];
  const nextForcedEvent = useRef<{
    eventName?: string;
    effectDescription?: string;
  } | null>(null);
  const setNextEvent = (eventName?: string, effectDescription?: string) => {
    nextForcedEvent.current = { eventName, effectDescription };
  };
  //隨機事件
  const triggerEvent = () => {
    let selectedEvent: GameEvent | undefined;
    let forcedEventName = nextForcedEvent.current?.eventName;
    let forcedEffectDescription = nextForcedEvent.current?.effectDescription;
    nextForcedEvent.current = null; // 用過就清空

    if (turn === 1) {
      selectedEvent = eventTable.find(e => e.name === "無事件");
    }
    // --- 1. 選擇事件（優先 forced） ---
    if (forcedEventName) {
      selectedEvent = eventTable.find(e => e.name === forcedEventName);
    }

    if (!selectedEvent) {
      const totalWeight = eventTable.reduce((sum, e) => sum + (e.weighted ?? 1), 0);
      let roll = Math.random() * totalWeight;
      for (const e of eventTable) {
        roll -= (e.weighted ?? 1);
        if (roll <= 0) {
          selectedEvent = e;
          break;
        }
      }
    }

    if (!selectedEvent) return;

    // --- 2. 選擇效果 ---
    let appliedEffect: EventEffect | undefined;

    if (Array.isArray(selectedEvent.effects)) {
      const effects = selectedEvent.effects;

      if (forcedEffectDescription) {
        appliedEffect = effects.find(e => e.description === forcedEffectDescription);
      }

      if (!appliedEffect) {
        const totalWeight = effects.reduce((sum, e) => sum + (e.weighted ?? 1), 0);
        let roll = Math.random() * totalWeight;
        for (const e of effects) {
          roll -= (e.weighted ?? 1);
          if (roll <= 0) {
            appliedEffect = e;
            break;
          }
        }
      }
    } else if (selectedEvent.effects) {
      appliedEffect = selectedEvent.effects;
    }

    // --- 3. 套用效果 ---
    if (appliedEffect) {
      appliedEffect.applyEffect?.();
      setEvent({
        ...selectedEvent,
        description: appliedEffect.description,
        effects: appliedEffect,
      });
    } else {
      setEvent(selectedEvent);
    }
  };
  // 回傳 Hook 提供的狀態和函式
  return {
    turn,
    players,
    generatePlayers,
    changePlayerName,
    battleFieldMonster: battleFieldMonsters,
    queueMonster: queueMonsters,
    generateMonster,
    submitAttack,
    advancePhase,
    phase,
    executeActionPhase,
    movePlayerIndexToFront,
    changePlayerField,
    rotatePlayers,
    event,
    eventTable,
    nextForcedEvent: nextForcedEvent.current,
    setNextEvent,
    triggerEvent,
  };
}

export type GameLogicType = ReturnType<typeof useGameLogic>;
