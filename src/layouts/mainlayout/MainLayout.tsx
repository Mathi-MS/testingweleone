import { Outlet } from "react-router-dom";
import Weleheader from "../../components/layout/Header";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Weleheader />
      <Outlet />
    </div>
  );
};

export default MainLayout;