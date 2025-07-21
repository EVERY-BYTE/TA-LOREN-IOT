import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardView from "../pages/dashboard/Dashboard";
import LoginView from "../pages/auth/LoginView";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import ErrorPage from "../pages/404";
import SignUpView from "../pages/auth/SignUpView";

export default function AppRouters() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const routers: { path: string; element: JSX.Element }[] = [];
  const authRouters: { path: string; element: JSX.Element }[] = [
    {
      path: "/",
      element: <LoginView />,
    },
    {
      path: "/login",
      element: <LoginView />,
    },
    {
      path: "/signup",
      element: <SignUpView />,
    },
  ];

  const mainRouters: { path: string; element: JSX.Element }[] = [
    {
      path: "/",
      element: <DashboardView />,
    },
  ];

  if (isAuthenticated) {
    routers.push(...mainRouters);
  } else {
    routers.push(...authRouters);
  }

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  const appRouters = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? <AppLayout /> : <AuthLayout />,
      errorElement: <ErrorPage />,
      children: routers,
    },
  ]);

  return <RouterProvider router={appRouters} />;
}
