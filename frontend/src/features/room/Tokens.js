import React, { useState, useEffect } from "react";
import { Token } from "./Token";

//import cx from "classnames";

export const Tokens = ({
    card,
}) => {
    if (card.aspectRatio < 1) return(
        <Token type="threat" amount="3" left={"10%"} top={"0%"}></Token>
    )
}
  
export default Tokens;