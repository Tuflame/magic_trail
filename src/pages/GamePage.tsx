import { useState} from "react";
import { useNavigate } from "react-router-dom";
import "./GamePage.css";
import { Order } from "../component/Order";
import { Battlefield } from "../component/Battlefield";
import { MonsterQueue } from "../component/MonsterQueue";
import { EventCard } from "../component/EventCard"

import type {GameLogicType} from "../hook/GameLogic"

export default function GamePage({ game }: { game: GameLogicType }) {
  const {
    players,
    generatePlayers,
    battleFieldMonster,
    queueMonster,
    generateMonster,
    movePlayerIndexToFront,
    rotatePlayers,
    triggerEvent,
    event,
  } = game;
  const navigate = useNavigate();
   return (
    <div className="main-container">
      <div className="left-section">
        <Order players={players} />
        <h2>控制區</h2>
        <button onClick={() => {generatePlayers(6)}}>生成玩家</button>
        <button onClick={() => movePlayerIndexToFront(3)}>將第3往前調動</button>
        <button onClick={rotatePlayers}>調動</button>
        <button onClick={generateMonster}>生成怪物</button>
        <button onClick={() =>triggerEvent()}>隨機事件</button>
        <button onClick={() => navigate("/control")}>前往控制頁</button>
      </div>
      <div className="middle-section">
        <div className="battlefield-wrapper">
          <Battlefield monsters={battleFieldMonster} />
        </div> 
        <div className="queue-wrapper">
          <MonsterQueue monsters={queueMonster} />
        </div>
      </div>

      <div className="right-section">
        <div className="WorldEvent-wrapper">
          {event ? (
              <EventCard event = {event}/> /* if 有 event 建立卡片*/
          ) : (
            <p>無事件資料</p>  /* if 有 event 建立卡片*/
          )}
        </div> 
        <div className="log-wrapper">
          {/* <MonsterQueue monsters={queueMonster} /> */}
        </div>
      </div>


    </div>
  );
}


