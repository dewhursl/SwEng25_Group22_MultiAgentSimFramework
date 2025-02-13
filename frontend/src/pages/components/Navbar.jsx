import React from "react";
import { navLinks } from "../../constants/index";

const Navbar = () => {
  const NavItems = () => {
    return (
      <ul className="flex gap-6">
        {navLinks.map(({ id, href, name, icon: Icon }) => (
          <li key={id} className="nav-li">
            <a
              href={href}
              className="flex items-center gap-2 text-md text-white hover:text-violet-400"
              onClick={() => {
                href;
              }}
            >
              <Icon className="text-violet-500 text-xl" />
              {name}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60]">
      <div className="bg-midnight shadow-lg shadow-violet-600/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-5">
          <div className="flex items-center">
            <img
              src="../assets/quantexa-logo-white.svg"
              alt="logo"
              className="w-34 h-6"
            />
          </div>
          <nav className="sm:flex hidden">
            <NavItems />
          </nav>
          <button className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
