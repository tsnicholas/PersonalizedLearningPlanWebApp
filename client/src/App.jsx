import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import LearningPlan from "./screens/LearningPlan/LearningPlan";
import LoginScreen from "./screens/login/login";
import Register from "./screens/register/Register"
import DefaultScreen from "./screens/Default/DefaultContainer";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<DefaultScreen />}>
          <Route path="/LearningPlan" element={<LearningPlan />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<Register />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
