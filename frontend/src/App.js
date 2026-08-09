import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import GamePage from "@/pages/GamePage";

function App() {
  return (
    <div className="App dark grain-overlay">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/joc/:slug" element={<GamePage />} />
        </Routes>
        <Toaster position="top-center" theme="dark" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
