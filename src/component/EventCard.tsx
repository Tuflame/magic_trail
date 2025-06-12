import "./EventCard.css"
import type { GameEvent } from "../hook/GameLogic";

type GameEventProps = {
  event:GameEvent ;
};

export default function EventCard({event}: GameEventProps) {

  return (
    <div className={"Event-card"}>

      <header className="Event-card-header">
        <h3 className="Event-name">{event ? event.name : "未知事件"}</h3>
      </header>


      <div className="Event-card-body">
        <div className="Event-image"></div>
          {event?.description ? (
            <h3 className="Event-description">{event.description}</h3>
          ) : (
            <p>無事件資料</p>
          )}
      </div>

      <div className="Event-card-bottom">
        {event?.effects && event.effects.length > 0 ? (
          <h3 className="Event-effects-description">{event.effects[0].description}</h3>
        ) : (
          <h3 className="Event-effects-description">無Effect</h3>
        )}
      </div>


    </div>
  );
}
