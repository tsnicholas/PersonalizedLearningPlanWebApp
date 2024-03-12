import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../features/login/hooks/useUser";

const PrivateRoute = () => {
  const location = useLocation();
  const { user } = useUser();
  `Access Token: ${user.accessToken}`;
  const isAuthenticated = user.accessToken !== "";
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default PrivateRoute;
