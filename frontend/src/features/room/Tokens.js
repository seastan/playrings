import React, { useState, useEffect } from "react";
import { Token } from "./Token";

//import cx from "classnames";

export const Tokens = ({
    card,
}) => {
    if (card.aspectRatio < 1) return(
        <div>
            <Token type="threat" amount="23" left={"10%"} top={"0%"}></Token>
            <Token type="willpower" amount="13" left={"10%"} top={"25%"}></Token>
            <Token type="attack" amount="8" left={"10%"} top={"50%"}></Token>
            <Token type="defense" amount="4" left={"10%"} top={"75%"}></Token>
            <Token type="resource" amount="3" left={"55%"} top={"0%"}></Token>
            <Token type="damage" amount="-1" left={"55%"} top={"25%"}></Token>
            <Token type="progress" amount="1" left={"55%"} top={"50%"}></Token>
            <Token type="time" amount="-3" left={"55%"} top={"75%"}></Token>
        </div>
    )
}
  
export default Tokens;