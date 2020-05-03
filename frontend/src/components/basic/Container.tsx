import React, { ReactNode } from "react";
//import React, { useState, useEffect, useContext } from "react";
//import cx from "classnames";

interface Props {
  children: ReactNode;
}

export const Container: React.FC<Props> = ({ children }) => {
  return <div className="container my-0 mx-auto p-4 max-w-none m-4">{children}</div>;
};
export default Container;
