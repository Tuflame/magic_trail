import { useState ,useEffect} from "react";
import "./GamePage.css";

import { useGameLogic } from "../hook/GameLogic";
import { Order } from "../component/Order";
import { Battlefield } from "../component/Battlefield";
import { MonsterQueue } from "../component/MonsterQueue";
import type { Player, Monster } from "../hook/GameLogic";

import type {GameLogicType} from "../hook/GameLogic"

export default function GamePage({ game }: { game: GameLogicType }) {
  const {
    players,
    generatePlayer,
    battleFieldMonster,
    queueMonster,
    generateMonster,
    killMonsterAt,
    movePlayerToFront,
    rotatePlayers,
    triggerRandomEvent,
  } = game;
  const [id,setID]=useState(1);

  const plus=()=>{
    setID((prev)=>(prev+1));
  }
   return (
    <div className="main-container">
      <div className="left-section">
        <Order players={players} />
        <h2>控制區</h2>
        <button onClick={() => {generatePlayer(id, `玩家${id}`),plus()}}>生成玩家</button>
        <button onClick={() => movePlayerToFront(3)}>將第3往前調動</button>
        <button onClick={rotatePlayers}>調動</button>
        <button onClick={generateMonster}>生成怪物</button>
        <button onClick={() => killMonsterAt(0)}>🗡️ 擊殺第1隻怪物</button>
        <button onClick={() => killMonsterAt(1)}>🗡️ 擊殺第2隻怪物</button>
        <button onClick={() => killMonsterAt(2)}>🗡️ 擊殺第3隻怪物</button>
        <button onClick={triggerRandomEvent}>隨機事件</button>
      </div>

      <div className="right-section">
        <div className="battlefield-wrapper">
          <Battlefield monsters={battleFieldMonster} />
        </div> 
        <div className="queue-wrapper">
          <MonsterQueue monsters={queueMonster}/>
        </div>
      </div>

    </div>
  );
}


