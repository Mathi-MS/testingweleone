// import { Outlet, useLocation } from "react-router-dom";
// import Header from "../components/layout/PublicHeader";

// const PublicLayout = () => {
//   const location = useLocation();
// const hideHeaderRoutes = ["/collegestudents"];
//   return (
//     <div className="min-h-screen">
//       {!hideHeaderRoutes.includes(location.pathname) && <Header />}
//       <Outlet />
//     </div>
//   );
// };

// export default PublicLayout;


import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/PublicHeader";


const PublicLayout = () => {
  const location = useLocation();

  // Correct array of routes
  const hideHeaderRoutes = ["/schoolstudents", "/collegestudents","/workingprofessionals","/jobseekers"];

  return (
    <div className="min-h-screen">
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Outlet />
    </div>
  );
};

export default PublicLayout;
