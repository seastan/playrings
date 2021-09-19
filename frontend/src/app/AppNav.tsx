import React, { useState } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import useAuth from "../hooks/useAuth";
import ProfileLink from "../features/auth/ProfileLink";
import useWindowDimensions from "../hooks/useWindowDimensions";

interface Props {}

export const AppNav: React.FC<Props> = () => {
  const { authToken, logOut } = useAuth();
  //const { height, width } = useWindowDimensions();
  const headerLinkClass =
    "mt-1 sm:mt-0 sm:ml-2 block px-2 py-1 text-white font-light hover:font-normal rounded no-underline";
  // if (height < 500) return null;
  // const aspectRatio = width/height;
  // alert(aspectRatio)
  // if (aspectRatio > 2) return null;
  return (
    <header className="bg-gray-700 flex justify-between items-center px-4" style={{height:"3vh",fontFamily:"Roboto", }}>
      <div className="flex items-center justify-between p-0 h-full">
        <div className="h-full">
          <Link
            to="/"
            className="absolute text-white no-underline h-full top-0"
            style={{fontSize: "2vh"}}
          >
            {/*
            <img
              className="h-8 rounded"
              src="https://placekitten.com/650/150"
              alt="Logo "
            />
                */}
            Dragn <img className="mb-1" style={{display:"inline", height: "2vh"}} src={process.env.PUBLIC_URL + '/logosvg.svg'}/> Cards
          </Link>
        </div>
      </div>
      <div
        className="flex"
        style={{fontSize: "2vh"}}
      >
        <ProfileLink className={headerLinkClass} />
        {!authToken && (
          <>
            <Link to="/login" className={headerLinkClass}>
              Log In
            </Link>
            <Link to="/signup" className={headerLinkClass}>
              Sign Up
            </Link>
          </>
        )}
        {authToken && (
          <>
            <span
              className={headerLinkClass + " underline cursor-pointer"}
              onClick={() => logOut()}
            >
              Sign out
            </span>
          </>
        )}
      </div>
    </header>
  );
};
export default AppNav;
