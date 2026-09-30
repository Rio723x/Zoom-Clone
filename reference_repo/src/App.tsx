import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Join from "./routes/Join";
import Schedule from "./routes/Schedule";
import MeetingRoom from "./routes/MeetingRoom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join" element={<Join />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/meeting/:roomId" element={<MeetingRoom />} />
    </Routes>
  );
}
