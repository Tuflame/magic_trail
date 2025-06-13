import type {Player} from "../hook/GameLogic"

import './PlayerCard.css';

type OrderProps = {
  player: Player;
};

export default function PlayerCard({player}:OrderProps){
    return(
        <div className="player-card">
          <div className="player-header">
            <div className="id">組別<br/>{player.id}</div>
            <div className="name">隊名<br/>{player.name}</div>
            <div className="gold">金幣<br/>{player.loot.gold}</div>
          </div>
          <div className="player-attributes">
            <div className="attribute water">{player.attack.水}</div>
            <div className="attribute fire">{player.attack.火}</div>
            <div className="attribute wood">{player.attack.木}</div>
          </div>
        </div>
    );
}