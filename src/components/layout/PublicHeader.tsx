import { useState } from 'react';
import wele from "../../assets/image/wele.svg";
import { Button } from '../ui';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const location = useLocation();

  // check active route
  const isSignup = location.pathname === "/signup";
  const islogin = location.pathname === "/login";
  return (
   <nav className="bg-white-10 shadow-lg ">
  <div className="flex items-center justify-between h-16 px-4 ">

    {/* Logo */}
    <div className="flex items-center ml-[10px]">
      <img src={wele} alt="wele" className="h-8 w-auto" />
    </div>

    {/* Desktop Search */}
    {/* <div className="hidden md:flex px-10 ml-auto w-[360px]">
  <div className="relative w-full max-w-md">
    <input
      type="text"
      placeholder="Search from anything..."
      className="w-full px-4 py-2 pr-10 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      <svg className="h-5 w-5 text-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  </div>
</div> */}


    {/* Desktop Buttons */}
   {/* Desktop Buttons */}
<div className="hidden  md:flex items-center space-x-5 mr-4">

  {/* Log in Button */}
<Button
   variant={islogin ? "primary" : "outline"}
  onClick={() => navigate("/login")}
  className={
        islogin
          ? "bg-primary text-white hover:bg-primary w-[115px] flex justify-center font-[750]"
          : "bg-white text-primary border border-primary hover:bg-primary hover:text-white w-[115px] flex justify-center font-[750]"
      }
>
  Log in
</Button>
  {/* Sign up Button */}
 <Button
      variant={isSignup ? "primary" : "outline"}
      className={
        isSignup
          ? "bg-primary text-white hover:bg-primary w-[115px] flex justify-center font-[750]"
          : "bg-white text-primary border border-primary hover:bg-primary hover:text-white w-[115px] flex justify-center font-[750]"
      }
      onClick={() => navigate("/signup")}
    >
      Sign up
    </Button>
</div>

    {/* Mobile Menu Button */}
    <div className="md:hidden">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 text-text-gray"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

  </div>

  {/* Mobile Dropdown */}
  {isMobileMenuOpen && (
    <div className=" md:hidden bg-white border-t border-border px-4 py-4 space-y-3">
      {/* <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 bg-white border border-border rounded-xl"
      /> */}

      <button 
      className={
        islogin
          ? "bg-primary text-white hover:bg-primary w-full  px-4 py-2 rounded-lg "
          : "bg-white text-primary border border-primary hover:bg-primary hover:text-white w-full px-4 py-2 rounded-lg"
      } onClick={() => navigate("/login")}>
        Log in
      </button>

      <button 
      className={
        isSignup
          ? " w-full bg-primary text-white hover:bg-primary  px-4 py-2 rounded-lg"
          : " w-full bg-white text-primary border border-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg "
      } onClick={() => navigate("/signup")}>
        Sign up
      </button>
    </div>
  )}
</nav>

  );
};

export default Header;