import React, { ReactNode } from "react";
//import React, { useState, useEffect, useContext } from "react";
//import cx from "classnames";

interface Props {
  children: ReactNode;
}

export const Container: React.FC<Props> = ({ children }) => {
  return <div className="container mx-auto max-w-none m-4 px-2">{children}</div>;
};
export default Container;
