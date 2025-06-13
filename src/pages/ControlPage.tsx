import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GameLogicType } from "../hook/GameLogic";

export default function ControlPage({ game }: { game: GameLogicType }) {
  const [playerId, setPlayerId] = useState(1);
  const [playerName, setPlayerName] = useState("");
  const [formInputs, setFormInputs] = useState<Record<number, { battleFieldIndex: number; cardType: string; element?: string }>>({});
  const navigate = useNavigate();

  const handleAddPlayer = () => {
    if (!playerName) return;
    game.generatePlayer(playerId, playerName);
    setFormInputs((prev) => ({ ...prev, [playerId]: { battleFieldIndex: 1, cardType: "魔法棒", element: "火" } }));
    setPlayerId((id) => id + 1);
    setPlayerName("");
  };

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

  const handleSubmitAllActions = () => {
    game.players.forEach((player) => {
      const input = formInputs[player.id];
      if (!input) return;

      const battleFieldIndex = Number(input.battleFieldIndex);
      if (battleFieldIndex < 1 || battleFieldIndex > 3) return;

      const action = {
        playerId: player.id,
        battleFieldIndex: battleFieldIndex - 1,
        cardType: input.cardType as any,
        element: input.cardType === "魔法棒" ? (input.element as any) : undefined,
        power: input.cardType === "魔法棒" && input.element ? player.attack[input.element as keyof typeof player.attack] : undefined,
      };

      game.submitAttack(action);
    });
  };

  const phaseList = ["事件", "準備", "行動", "結算"];
  const currentPhaseIndex = phaseList.indexOf(game.phase);
  const phasePercent = ((currentPhaseIndex + 1) / phaseList.length) * 100;

  return (
    <div>
      <div>
        <button onClick={() => navigate("/")}>前往遊戲頁</button>
        <h2>當前回合：第 {game.turn} 回合</h2>
        <h3>當前事件：{game.event ? game.event.name + " - " + game.event.description : "無事件"}</h3>
        <div>
          <p>當前階段：{game.phase}</p>
        </div>
      </div>

      {game.turn === 1 && (
        <div>
          <h2>新增玩家</h2>
          <div>
            <input
              placeholder="玩家ID"
              type="number"
              value={playerId}
              onChange={(e) => setPlayerId(Number(e.target.value))}
            />
            <input
              placeholder="玩家名稱"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <button onClick={handleAddPlayer}>加入</button>
          </div>
        </div>
      )}

      <div>
        <h2>玩家列表</h2>
        <ul>
          {game.players.map((player, index) => (
            <li key={player.id}>
              #{index + 1} - {player.name} (ID: {player.id}) 金幣: {player.loot.gold} 魔能石: {player.loot.manaStone}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>輸入玩家行動</h2>
        {game.players.map((player) => (
          <div key={player.id}>
            <div>玩家 {player.name}（ID: {player.id}）</div>
            <div>
              <input
                placeholder="目標位置 (輸入1~3)"
                type="number"
                min={1}
                max={3}
                value={formInputs[player.id]?.battleFieldIndex ?? 1}
                onChange={(e) => handleInputChange(player.id, "battleFieldIndex", Number(e.target.value))}
              />
              <select
                value={formInputs[player.id]?.cardType}
                onChange={(e) => handleInputChange(player.id, "cardType", e.target.value)}
              >
                <option value="魔法棒">魔法棒</option>
                <option value="冰凍法術">冰凍法術</option>
                <option value="爆裂法術">爆裂法術</option>
                <option value="毒藥法術">毒藥法術</option>
              </select>
              {formInputs[player.id]?.cardType === "魔法棒" && (
                <select
                  value={formInputs[player.id]?.element}
                  onChange={(e) => handleInputChange(player.id, "element", e.target.value)}
                >
                  <option value="火">火</option>
                  <option value="水">水</option>
                  <option value="木">木</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2>已選擇行動（預覽）</h2>
        <ul>
          {game.players.map((player) => {
            const input = formInputs[player.id];
            if (!input) return null;
            const battlefield = input.battleFieldIndex;
            const card = input.cardType;
            const element = input.element ?? "-";
            return (
              <li key={player.id}>
                玩家 {player.name}（ID: {player.id}） - 攻擊戰場 {battlefield}，使用 {card} {card === "魔法棒" ? `(${element})` : ""}
              </li>
            );
          })}
        </ul>
        <button onClick={handleSubmitAllActions}>提交所有行動</button>
      </div>

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
            <li key={idx}>{m.name}（${m.HP}/${m.maxHP}）屬性:{m.type}</li>
          ))}
        </ul>
        <button onClick={game.generateMonster}>生成怪物</button>
      </div>

      <div>
        <button onClick={game.advancePhase}>
          下一階段：{game.phase}
        </button>
      </div>
    </div>
  );
}
