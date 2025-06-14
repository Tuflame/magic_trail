import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { GameLogicType, ElementType, AttackCardType, EventEffect } from "../hook/GameLogic";

export default function ControlPage({ game }: { game: GameLogicType }) {
  const {
    turn,
    players,
    generatePlayers,
    changePlayerName,
    movePlayerIndexToFront,
    battleFieldMonster,
    queueMonster,
    submitAttack,
    advancePhase,
    phase,
    event,
    eventTable,
    setNextEvent,
    changePlayerField,
  } = game;
  const navigate = useNavigate();

  const [playerCount, setPlayerCount] = useState(6);
  const [nextEventName, setNextEventName] = useState<string>("");
  const [nextEffectDesc, setNextEffectDesc] = useState<string>("");

    const [attackInputs, setAttackInputs] = useState<any[]>([]);
    const [previewActions, setPreviewActions] = useState<any[] | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  useEffect(() => {
    setAttackInputs(
        players.map((player) => ({
        playerId: player.id,
        cardType: "魔法棒",
        element: "火",
        power: 1,
        target: 0,
        }))
    );
    setPreviewActions(null); // 玩家重生或切換頁面時同步清除預覽
    }, [players]);

  // 處理攻擊 input 變更
  const handleAttackChange = (
    index: number,
    field: keyof typeof attackInputs[0],
    value: string | number | ElementType | AttackCardType
  ) => {
    setAttackInputs((prev) => {
      const newInputs = [...prev];
      const updated = { ...newInputs[index], [field]: value };
      if (field === "element" && value !== "無") {
        const player = players.find((p) => p.id === updated.playerId);
        if (player && (value === "火" || value === "水" || value === "木")) {
          updated.power = player.attack[value];
        }
      }
      newInputs[index] = updated;
      return newInputs;
    });
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>前往遊戲頁</button>
      <h1>控制台 - 回合 {turn}（{phase}）</h1>
      <h2>{event?.name}</h2>
      <div>
        <h2>指定下一回合事件</h2>
        <select value={nextEventName} onChange={(e) => {
          setNextEventName(e.target.value);
          const ev = eventTable.find(ev => ev.name === e.target.value);
          if (Array.isArray(ev?.effects)) {
            const firstEffect = ev.effects[0] as EventEffect;
            setNextEffectDesc(firstEffect?.description || "");
          } else if (typeof ev?.effects === 'object') {
            setNextEffectDesc(ev.effects?.description || "");
          }
        }}>
          <option value="">-- 不指定事件 --</option> 
          {eventTable.map((e) => (
            <option key={e.name} value={e.name}>{e.name}</option>
          ))}
        </select>

        {(() => {
          const selected = eventTable.find(e => e.name === nextEventName);
          if (Array.isArray(selected?.effects)) {
            return (
              <select
                value={nextEffectDesc}
                onChange={(e) => setNextEffectDesc(e.target.value)}
              >
                {selected.effects.map((eff) => (
                  <option key={eff.description} value={eff.description}>{eff.description}</option>
                ))}
              </select>
            );
          }
          return null;
        })()}

        <button
          onClick={() => setNextEvent(nextEventName || undefined, nextEffectDesc || undefined)}
        >
          設定下一事件
        </button>
      </div>
      <div>
        <button
            onClick={advancePhase}
            // 行動階段未送出時，不可按
            disabled={phase === "行動" && (!hasSubmitted || !previewActions)}
            style={phase === "行動" && (!hasSubmitted || !previewActions) ? { opacity: 0.4, pointerEvents: "none" } : {}}
        >
            前往下一階段
        </button>
        {(!hasSubmitted || !previewActions)&&
            <div>請先提交行動</div>
        }
      </div>

      {players.length === 0 && (
        <div>
            <h2>輸入玩家數並生成</h2>
            <input
            type="number"
            value={playerCount}
            min={1}
            onChange={(e) => {
                // 防呆：不可為 0、負數或 NaN
                const v = Math.max(1, Number(e.target.value) || 1);
                setPlayerCount(v);
            }}
            style={{ width: 60 }}
            />
            <button
            onClick={() => {
                // 重設所有攻擊與預覽狀態
                game.generatePlayers(playerCount);
                setAttackInputs(
                Array.from({ length: playerCount }, (_, i) => ({
                    playerId: i + 1,
                    cardType: "魔法棒" as AttackCardType,
                    element: "火" as ElementType,
                    power: 1,
                    target: 0 as 0 | 1 | 2,
                }))
                );
                setPreviewActions(null);
            }}
            style={{ marginLeft: 12 }}
            >
            生成玩家
            </button>
        </div>
        )}

      <div>
        <h2>玩家列表</h2>
        {players.map((p) => (
          <div key={p.id} style={{ border: '1px solid #888', margin: 8, padding: 8 }}>
            <div>
              <strong>ID: {p.id}</strong>
            </div>
            <div>
              名稱：
              <input
                value={p.name}
                onChange={e => changePlayerField(p.id, ['name'], e.target.value)}
              />
            </div>
            <div>
              <span>攻擊：</span>
              火：
              <input
                type="number"
                value={p.attack.火}
                min={0}
                onChange={e => changePlayerField(p.id, ['attack', '火'], Number(e.target.value))}
              />
              水：
              <input
                type="number"
                value={p.attack.水}
                min={0}
                onChange={e => changePlayerField(p.id, ['attack', '水'], Number(e.target.value))}
              />
              木：
              <input
                type="number"
                value={p.attack.木}
                min={0}
                onChange={e => changePlayerField(p.id, ['attack', '木'], Number(e.target.value))}
              />
            </div>
            <div>
              <span>金幣：</span>
              <input
                type="number"
                value={p.loot.gold}
                min={0}
                onChange={e => changePlayerField(p.id, ['loot', 'gold'], Number(e.target.value))}
              />
              <span> 魔能石：</span>
              <input
                type="number"
                value={p.loot.manaStone}
                min={0}
                onChange={e => changePlayerField(p.id, ['loot', 'manaStone'], Number(e.target.value))}
              />
            </div>
            <div>
              <span>法術卡：</span>
              {Object.entries(p.loot.spellCards).map(([card, count]) => (
                <span key={card} style={{ marginRight: 8 }}>
                  {card}：
                  <input
                    type="number"
                    value={count}
                    min={0}
                    onChange={e =>
                      changePlayerField(
                        p.id,
                        ['loot', 'spellCards', card],
                        Number(e.target.value)
                      )
                    }
                    style={{ width: 40 }}
                  />
                </span>
              ))}
            </div>
            <button onClick={() => movePlayerIndexToFront(p.id)}>調到最前</button>
          </div>
        ))}
      </div>

    {(attackInputs[0]&&phase==="行動") && 
      <div>
        <h2>攻擊輸入</h2>
        {players.map((p, i) => (
          <div key={p.id}>
            <span>{p.name}：</span>
            <select
              value={attackInputs[i]?.cardType}
              onChange={(e) => handleAttackChange(i, "cardType", e.target.value as AttackCardType)}
              disabled={!!previewActions}
            >
              <option value="魔法棒">魔法棒</option>
              {Object.entries(p.loot.spellCards)
                .filter(([cardType, count]) => cardType !== "魔法棒" && count > 0)
                .map(([cardType]) => (
                  <option key={cardType} value={cardType}>{cardType}</option>
                ))}
            </select>
            {attackInputs[i]?.cardType === "魔法棒" && (
              <>
                <select
                  value={attackInputs[i].element}
                  onChange={(e) => handleAttackChange(i, "element", e.target.value as ElementType)}
                  disabled={!!previewActions}
                >
                  <option value="火">火</option>
                  <option value="水">水</option>
                  <option value="木">木</option>
                </select>
                <span>威力: {attackInputs[i].power}</span>
              </>
            )}
            <select
              value={attackInputs[i].target}
              onChange={(e) => handleAttackChange(i, "target", Number(e.target.value) as 0 | 1 | 2)}
              disabled={!!previewActions}
            >
              <option value={0}>戰場 A</option>
              <option value={1}>戰場 B</option>
              <option value={2}>戰場 C</option>
            </select>
          </div>
        ))}
        {/* 預覽還沒啟動才出現「提交全部」 */}
        {!previewActions && (
          <button
            style={{ marginTop: 12 }}
            onClick={() => setPreviewActions([...attackInputs])}
          >提交全部（預覽）</button>
        )}
      </div>
      }

      {/* 預覽區塊 */}
        {previewActions && (
        <div style={{ border: "1px solid #fc0", padding: 12, margin: 12 }}>
            <h3>請再次確認玩家行動</h3>
            <ol>
            {players.map((p, i) => {
                const act = previewActions[i];
                return (
                <li key={p.id}>
                    {p.name}：{act.cardType}
                    {act.cardType === "魔法棒"
                    ? `（${act.element}、威力${act.power}，攻擊戰場${["A", "B", "C"][act.target]}）`
                    : `（攻擊戰場${["A", "B", "C"][act.target]}）`
                    }
                </li>
                );
            })}
            </ol>
            <button
            style={{ marginTop: 12, background: "#5f5", border: "1px solid #880" }}
            onClick={() => {
                if (hasSubmitted) return;
                previewActions.forEach((act, idx) => {
                submitAttack({
                    playerId: players[idx].id, // 按目前陣列順序送出
                    cardType: act.cardType,
                    element: act.cardType === "魔法棒" ? act.element : undefined,
                    power: act.cardType === "魔法棒" ? act.power : undefined,
                    battleFieldIndex: act.target,
                });
                });
                setHasSubmitted(true);
            }}
            disabled={hasSubmitted}
            >
            {hasSubmitted ? "已提交" : "確認送出"}
            </button>
            <button
            style={{ marginLeft: 12 }}
            onClick={() => {
                setPreviewActions(null);
                setHasSubmitted(false);
            }}
            >取消</button>
        </div>
        )}

      <div>
        <h2>戰場怪物</h2>
        <ul>
          {battleFieldMonster.map((m, i) => (
            <li key={i}>
                {m ? (
                    <>
                    {`${m.moster.name}（HP: ${m.moster.HP}/${m.moster.maxHP}）`}
                    <br />
                    <span>
                        戰利品：
                        {m.moster.loot.gold > 0 && ` 金幣×${m.moster.loot.gold} `}
                        {m.moster.loot.manaStone > 0 && ` 魔力石×${m.moster.loot.manaStone} `}
                        {m.moster.loot.spellCards && ` 法術卡：${m.moster.loot.spellCards}`}
                        {(m.moster.loot.gold === 0 && m.moster.loot.manaStone === 0 && !m.moster.loot.spellCards) && "無"}
                    </span>
                    </>
                ) : (
                    "空"
                )}
                </li>
          ))}
        </ul>
        <h2>列隊怪物</h2>
        <ul>
          {queueMonster.map((m, i) => (
            <li key={i}>{m.name}（HP: {m.HP}）</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
