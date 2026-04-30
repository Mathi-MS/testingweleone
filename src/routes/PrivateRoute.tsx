import { Navigate, Outlet } from "react-router-dom";


const PrivateRoute = () => {
  // const accessToken = sessionStorage.getItem("accessToken");
  // const isGuest = sessionStorage.getItem("guest") === "true";

  // if (!accessToken || !isGuest ) {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
};

export default PrivateRoute;

