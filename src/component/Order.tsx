import type {Player} from "../hook/GameLogic"
import PlayerCard from "./PlayerCard"

type OrderProps = {
  players: Player[];
};

export function Order({players}:OrderProps){
    return(
        <>
        {players.map((player) => (
                <PlayerCard player={player} />
              ))}
        </>
    );
}