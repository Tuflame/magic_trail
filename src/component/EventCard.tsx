import "./EventCard.css"
import type { GameEvent } from "../hook/GameLogic";

type GameEventProps = {
  event:GameEvent ;
};

export default function EventCard({event}: GameEventProps) {

  return (
    <div className={"Event-card"}>
      <div className="Event-card-body">
        <div className="Event-image">👾</div>
        {event ? ( /* 理論上不會是空， 前面已做防呆*/
        <>
          <h3 className="Event-name">{event.name}</h3>
          <h3 className="Event-description">{event.description}</h3>
        </>
      ) : (
        <p>無事件資料</p>
      )}
      </div>
    </div>
  );
}
