import React from "react";
import { Link } from "react-router-dom";
import AccountButton from "./AccountButton";

const NavBar = () => {
  return (
    <header className="flex w-full sticky top-0 flex-col justify-between items-center text-center p-0 bg-white text-text-color z-10">
      <nav className="flex items-center justify-between w-full h-12 bg-element-base p-11">
        <Link to="/#">
          <h1 className="text-3xl font-headlineFont">
            Personalized Learning Website
          </h1>
        </Link>
        <AccountButton />
      </nav>

      <nav className="flex flex-row items-center w-full shadow-md">
        <ul className="flex flex-row items-center w-full h-12 text-2xl justify-evenly">
          <li className="inline-block relative after:block after:m-auto after:h-1 after:w-0 after:bg-transparent after:content-[''] after:transition-width after:duration-500 after:ease-in-out  hover:after:w-full hover:after:bg-element-base">
            <Link
              to="/LearningPlan"
              className="w-full text-black hover:text-element-base"
            >
              {" "}
              Learning Plan
            </Link>
          </li>
          <li className="inline-block relative after:block after:m-auto after:h-1 after:w-0 after:bg-transparent after:content-[''] after:transition-width after:duration-500 after:ease-in-out  hover:after:w-full hover:after:bg-element-base">
            <Link to="/#" className="w-full text-black hover:text-element-base">
              {" "}
              Coach
            </Link>
          </li>
          <li className="inline-block relative after:block after:m-auto after:h-1 after:w-0 after:bg-transparent after:content-[''] after:transition-width after:duration-500 after:ease-in-out  hover:after:w-full hover:after:bg-element-base">
            <Link 
              to="/Dashboard" 
              className="w-full text-black hover:text-element-base"
            >
              {" "}
              Dashboard
            </Link>
          </li>
          <li className="inline-block relative after:block after:m-auto after:h-1 after:w-0 after:bg-transparent after:content-[''] after:transition-width after:duration-500 after:ease-in-out  hover:after:w-full hover:after:bg-element-base">
            <Link
              to="/profile"
              className="w-full text-black hover:text-element-base"
            >
              {" "}
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
