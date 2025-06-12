import { BrowserRouter, Routes, Route } from "react-router-dom";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ControlPage from "./ControlPage.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/control" element={<ControlPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
