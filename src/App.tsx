import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GamePage from "./pages/GamePage";
import ControlPage from "./pages/ControlPage";
import { useGameLogic } from "./hook/GameLogic";

export default function App() {
  const gameLogic = useGameLogic();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GamePage game={gameLogic} />} />
        <Route path="/control" element={<ControlPage game={gameLogic} />} />
      </Routes>
    </Router>
  );
}
