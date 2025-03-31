import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Contexts/ThemeProvider";
import { ToastContainer } from "react-toastify";
import Analysis from "./Components/Analysis";
import Competitors from "./Components/Competitors";
import Compare from "./Components/Compare";
function App() {
  return (
    <>
      <Router>
        <ThemeProvider>
          <ToastContainer />
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <Dashboard />
              </>
            } />
            <Route path="/analysis" element={
              <>
                <Navbar />
                <Analysis />
              </>
            } />
            <Route path="/competitors" element={
              <>
                <Navbar />
                <Competitors />
              </>
            } />
            <Route path="/compare" element={
              <>
                <Navbar />
                <Compare />
              </>
            } />
          </Routes>
        </ThemeProvider>
      </Router>
    </>
  )
}

export default App
