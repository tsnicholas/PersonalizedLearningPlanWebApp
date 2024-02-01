import React from "react";
import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LearningPlan from "./screens/LearningPlan";
import LoginScreen from "./screens/Login";
import Register from "./screens/Register";
import DefaultScreen from "./screens/DefaultContainer";
import Goals from "./screens/Goals";
import ProfileScreen from "./screens/Profile";
import DashboardScreen from "./screens/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<DefaultScreen />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/LearningPlan" element={<LearningPlan />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/goals/:id" element={<Goals />} />
              </Route>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
