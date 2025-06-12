import { useState ,useEffect} from "react";
import "./App.css";

import { useGameLogic } from "./hook/GameLogic";
import {Order} from "./component/Order"
import { Battlefield } from "./component/Battlefield";
import { MonsterQueue } from "./component/MonsterQueue";
import type {Player,Monster} from "./hook/GameLogic"

export default function GamePage() {
  const {
    battleFieldMonster,
    queueMonster,
    generatePlayer,
    generateMonster,
    clearMonsters,
    killMonsterAt
  } = useGameLogic();

  const [players,setPlayers]=useState<Player[]>([]);

  const handleGeneratePlayer=()=>{
    for(let i=1;i<=6;i++){
        const newPlayer=generatePlayer(i,"挑戰者")
        setPlayers(prev=>[...prev,newPlayer]);      
    }
  }

  return (
    <div className="main-container">
      <div className="left-section">
        <Order players={players}></Order>
        <h2>控制區</h2>
        <button onClick={handleGeneratePlayer}>生成玩家</button>
        <button onClick={generateMonster}>生成怪物</button>
        <button onClick={() => killMonsterAt(0)}>🗡️ 擊殺第1隻怪物</button>
        <button onClick={() => killMonsterAt(1)}>🗡️ 擊殺第2隻怪物</button>
        <button onClick={() => killMonsterAt(2)}>🗡️ 擊殺第3隻怪物</button>
      </div>

      <div className="right-section">
        <Battlefield monsters={battleFieldMonster} />
        <MonsterQueue monsters={queueMonster} />
      </div>
    </div>
  );
}
