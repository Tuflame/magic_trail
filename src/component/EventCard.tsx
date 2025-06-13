import "./EventCard.css"
import type { GameEvent } from "../hook/GameLogic";

type GameEventProps = {
  event:GameEvent ;
};

export function EventCard({event}: GameEventProps) {

  return (
    <div className={"Event-card"}>

      <header className="Event-card-header">
        <div className="section-header">
          <h2 className="section-title">本局事件</h2>
        </div>
        <h3 className="Event-name">
          {event ? `${event.name} :` : "未知事件"}
        </h3>
      </header>


      <div className="Event-card-body">
        <div className="Event-image"></div>
          {event?.description ? (
            <h3 className="Event-description">{event.description}</h3>
          ) : (
            <p>無事件資料</p>
          )}
      </div>
    </div>
  );
}
