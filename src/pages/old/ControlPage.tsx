import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { EventEffect, GameLogicType } from "../hook/GameLogic";

export default function ControlPage({ game }: { game: GameLogicType }) {
  const [playerCount, setPlayerCount] = useState(1);
  const [formInputs, setFormInputs] = useState<Record<number, { battleFieldIndex: number; cardType: string; element?: string }>>({});
  const [nameInputs, setNameInputs] = useState<Record<number, string>>({});
  const [stagedActions, setStagedActions] = useState<any[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [selectedEffectDesc, setSelectedEffectDesc] = useState<string>("");

  const navigate = useNavigate();

  const handleGeneratePlayers = () => {
    game.generatePlayers(playerCount);

    const newFormInputs: typeof formInputs = {};
    const newNameInputs: typeof nameInputs = {};
    for (let i = 1; i <= playerCount; i++) {
      newFormInputs[i] = { battleFieldIndex: 1, cardType: "魔法棒", element: "火" };
      newNameInputs[i] = `玩家${i}`;
    }
    setFormInputs(newFormInputs);
    setNameInputs(newNameInputs);
  };

  useEffect(() => {
    game.players.forEach((player) => {
      if (!formInputs[player.id]) {
        setFormInputs((prev) => ({
          ...prev,
          [player.id]: { battleFieldIndex: 1, cardType: "魔法棒", element: "火" },
        }));
      }
    });
  }, [game.players]);

  const handleInputChange = (playerId: number, field: string, value: string | number) => {
    if (field === "battleFieldIndex") {
      const num = Number(value);
      if (num < 1 || num > 3) return;
    }
    setFormInputs((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  const handleNameChange = (playerId: number, name: string) => {
    setNameInputs((prev) => ({ ...prev, [playerId]: name }));
    const player = game.players.find(p => p.id === playerId);
    if (player) player.name = name;
  };

  const stageAllActions = () => {
    const staged = game.players.map((player) => {
      const input = formInputs[player.id];
      if (!input) return null;

      const battleFieldIndex = Number(input.battleFieldIndex);
      if (battleFieldIndex < 1 || battleFieldIndex > 3) return null;

      return {
        playerId: player.id,
        playerName: player.name,
        battleFieldIndex,
        cardType: input.cardType,
        element: input.cardType === "魔法棒" ? input.element : undefined,
        power: input.cardType === "魔法棒" && input.element ? player.attack[input.element as keyof typeof player.attack] : undefined,
      };
    }).filter(Boolean);
    setStagedActions(staged);
  };

  const handleSubmitAllActions = () => {
    stagedActions.forEach((action) => {
      game.submitAttack({
        playerId: action.playerId,
        battleFieldIndex: (action.battleFieldIndex - 1) as 0 | 1 | 2,
        cardType: action.cardType,
        element: action.element,
        power: action.power,
      });
    });
    setStagedActions([]);
    setHasSubmitted(true);
  };

  const handleTriggerEvent = () => {
    game.triggerEvent?.();
  };

  const handleSetNextEvent = () => {
    game.setNextEvent?.(selectedEventName || undefined, selectedEffectDesc || undefined);
  };

  useEffect(() => {
    setHasSubmitted(false);
  }, [game.phase]);

  return (
    <div>
      <button onClick={() => navigate("/")}>前往遊戲頁</button>
      <h2>當前回合：第 {game.turn} 回合</h2>
      <h3>當前事件：{game.event ? `${game.event.name} - ${game.event.description}` : "無事件"}</h3>
      <p>當前階段：{game.phase}</p>

      {(game.turn === 1 && game.phase === "事件") && (
        <div>
          <h2>生成玩家</h2>
          <input type="number" value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} placeholder="玩家數量" />
          <button onClick={handleGeneratePlayers}>生成</button>
          <div>
            {Object.entries(nameInputs).map(([idStr, name]) => {
              const id = Number(idStr);
              return (
                <div key={id}>
                  玩家 {id} 名稱：
                  <input value={name} onChange={(e) => handleNameChange(id, e.target.value)} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2>玩家列表</h2>
        <ul>
          {game.players.map((player, index) => (
            <li key={player.id}>
              #{index + 1} - {player.name} (ID: {player.id})｜金幣: {player.loot.gold}｜魔能石: {player.loot.manaStone}
              <div>屬性傷害：火: {player.attack.火}｜水: {player.attack.水}｜木: {player.attack.木}</div>
              <div>
                法術卡：
                {Object.entries(player.loot.spellCards)
                  .filter(([_, count]) => count > 0)
                  .map(([type, count]) => `${type} x${count}`)
                  .join("，")}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {game.phase === "行動" && (
        <div>
          <h2>輸入玩家行動</h2>
          {game.players.map((player) => (
            <div key={player.id}>
              玩家 {player.name}（ID: {player.id}）
              <input type="number" min={1} max={3} value={formInputs[player.id]?.battleFieldIndex ?? 1} onChange={(e) => handleInputChange(player.id, "battleFieldIndex", Number(e.target.value))} />
              <select value={formInputs[player.id]?.cardType} onChange={(e) => handleInputChange(player.id, "cardType", e.target.value)}>
                <option value="魔法棒">魔法棒</option>
                {Object.entries(player.loot.spellCards).map(([card, count]) =>
                  card !== "魔法棒" && count > 0 ? (
                    <option key={card} value={card}>
                      {card}（剩餘 {count} 張）
                    </option>
                  ) : null
                )}
              </select>
              {formInputs[player.id]?.cardType === "魔法棒" && (
                <>
                  <select value={formInputs[player.id]?.element} onChange={(e) => handleInputChange(player.id, "element", e.target.value)}>
                    <option value="火">火</option>
                    <option value="水">水</option>
                    <option value="木">木</option>
                  </select>
                  <span>傷害值：{formInputs[player.id]?.element ? player.attack[formInputs[player.id].element as keyof typeof player.attack] : "-"}</span>
                </>
              )}
            </div>
          ))}
          <button onClick={stageAllActions}>確認行動（預覽）</button>
          <ul>
            {stagedActions.map((action) => (
              <li key={action.playerId}>
                玩家 {action.playerName} 攻擊 {action.battleFieldIndex} 號，用 {action.cardType}
                {action.cardType === "魔法棒" && `（${action.element}） 傷害 ${action.power}`}
              </li>
            ))}
          </ul>
          <button onClick={handleSubmitAllActions} disabled={hasSubmitted}>提交所有行動</button>
          {hasSubmitted && <p style={{ color: "green", fontWeight: "bold" }}>✅ 已提交</p>}
        </div>
      )}

      <div>
        <h2>戰場區域</h2>
        <ul>
          {game.battleFieldMonster.map((slot, idx) => (
            <li key={idx}>
              {slot ? `${idx + 1}. ${slot.moster.name} (${slot.moster.HP}/${slot.moster.maxHP}) 屬性:${slot.moster.type}` : `${idx + 1}. 空`}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>列隊區域</h2>
        <ul>
          {game.queueMonster.map((m, idx) => (
            <li key={idx}>{m.name}（{m.HP}/{m.maxHP}）屬性:{m.type}</li>
          ))}
        </ul>
        <button onClick={game.generateMonster}>生成怪物</button>
      </div>

      <div>
        <h2>事件設定面板</h2>

        {game.nextForcedEvent && (
          <p style={{ color: "orange" }}>
            ⚠️ 已設定下回合事件：{game.nextForcedEvent.eventName}
            {game.nextForcedEvent.effectDescription && ` - ${game.nextForcedEvent.effectDescription}`}
          </p>
        )}

        <fieldset style={{ border: "1px solid gray", padding: "10px", borderRadius: "8px", marginBottom: "1em" }}>
          <legend>預設下回合事件</legend>
          <label>
            事件類型：
            <select value={selectedEventName} onChange={(e) => {
              const name = e.target.value;
              setSelectedEventName(name);
              setSelectedEffectDesc(""); // 重置效果
            }}>
              <option value="">-- 隨機事件 --</option>
              {game.eventTable.map((ev) => (
                <option key={ev.name} value={ev.name}>{ev.name}</option>
              ))}
            </select>
          </label>

          {/* 強制顯示子效果選單（只要該事件 effects 為陣列） */}
          {(() => {
            const selectedEvent = game.eventTable.find(e => e.name === selectedEventName);
            if (selectedEvent && Array.isArray(selectedEvent.effects)) {
              return (
                <label>
                  效果選擇：
                  <select value={selectedEffectDesc} onChange={(e) => setSelectedEffectDesc(e.target.value)}>
                    <option value="">-- 隨機效果 --</option>
                    {selectedEvent.effects.map((eff: EventEffect) => (
                      <option key={eff.description} value={eff.description}>
                        {eff.description}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }
            return null;
          })()}

          <div style={{ marginTop: "10px" }}>
            <button onClick={handleSetNextEvent}>✅ 設定下一回合事件</button>
          </div>
        </fieldset>

        <fieldset style={{ border: "1px dashed gray", padding: "10px", borderRadius: "8px" }}>
          <legend>立即觸發（測試用）</legend>
          <button onClick={handleTriggerEvent}>🎲 立即觸發事件</button>
        </fieldset>
      </div>

      <div>
        <button onClick={game.advancePhase}>進入下一階段</button>
      </div>
    </div>
  );
}
