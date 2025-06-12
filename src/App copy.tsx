import { useState } from "react";
import "./App.css";

import { useGameLogic } from "./hook/GameLogic";
import {Order} from "./component/Order"
import { Battlefield } from "./component/Battlefield";
// import { MonsterQueue } from "./component/MonsterQueue";
import { MonsterQueue } from "./component/MonsterQueue";
import type {Player,Monster} from "./hook/GameLogic"

export default function GamePage() {
  const {
    generatePlayer,
    generateMonster,
    generateMultipleMonsters,
    clearMonsters,
  } = useGameLogic();

  const [players,setPlayers]=useState<Player[]>([]);

  const [monsters,setMonseters]=useState<Monster[]>([]);
  const [monsterCounter,setMonsterCounter]=useState(0);

  const handleGenerateMonster = () => {
    setMonsterCounter(n=>n+1);
    const newMonster = generateMonster();
    setMonseters(prev => [...prev, newMonster]);
  };

  const handleGeneratePlayer=()=>{
    for(let i=1;i<=6;i++){
        const newPlayer=generatePlayer(i,"挑戰者")
        setPlayers(prev=>[...prev,newPlayer]);      
    }
  }

  const handleDefeat=()=>{

  }

  return (
    <div className="main-container">
      <div className="left-section">
        <Order players={players}></Order>
        <h2>控制區</h2>
        <button onClick={handleGeneratePlayer}>生成玩家</button>
        <button onClick={handleGenerateMonster}>生成怪物</button>
      </div>

      <div className="right-section">
        <Battlefield monsters={monsters.slice(0, 3)} />
        <MonsterQueue monsters={monsters.slice(3, 6)} />
      </div>
    </div>
  );
}
