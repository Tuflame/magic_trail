import type {Player} from "../hook/GameLogic"

type OrderProps = {
  player: Player;
};

export default function PlayerCard({player}:OrderProps){
    return(
        <div className="player-card">
          <div className="player-header">
            <div className="player-number">{player.id}</div>
            <div className="player-name">{player.name}</div>
            <div className="player_gold">{player.loot.gold}</div>
          </div>
          <div className="player-attributes">
            <div className="attribute water">{player.attack.水}</div>
            <div className="attribute fire">{player.attack.火}</div>
            <div className="attribute wood">{player.attack.木}</div>
          </div>
        </div>
    );
}