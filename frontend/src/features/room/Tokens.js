import React, { useState, useEffect } from "react";
import { Token } from "./Token";

//import cx from "classnames";

export const Tokens = ({
    card,
    adjustVisible,
}) => {
    if (card.aspectRatio < 1) return(
        <div>
            {/* {0 ? <Token type="threat" amount={0} left={"10%"} top={"0%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="willpower" amount={0} left={"10%"} top={"25%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="attack" amount={0} left={"10%"} top={"50%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="defense" amount={0} left={"10%"} top={"75%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="resource" amount={0} left={"55%"} top={"0%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="damage" amount={0} left={"55%"} top={"25%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="progress" amount={0} left={"55%"} top={"50%"} adjustVisible={adjustVisible}></Token>:null}
            {0 ? <Token type="time" amount={0} left={"55%"} top={"75%"} adjustVisible={adjustVisible}></Token>:null} */}
            <Token type="threat" amount={0} left={"10%"} top={"0%"} adjustVisible={adjustVisible}></Token>
            <Token type="willpower" amount={13} left={"10%"} top={"25%"} adjustVisible={adjustVisible}></Token>
            <Token type="attack" amount={8} left={"10%"} top={"50%"} adjustVisible={adjustVisible}></Token>
            <Token type="defense" amount={0} left={"10%"} top={"75%"} adjustVisible={adjustVisible}></Token>
            <Token type="resource" amount={3} left={"55%"} top={"0%"} adjustVisible={adjustVisible}></Token>
            <Token type="damage" amount={-1} left={"55%"} top={"25%"} adjustVisible={adjustVisible}></Token>
            <Token type="progress" amount={1} left={"55%"} top={"50%"} adjustVisible={adjustVisible}></Token>
            <Token type="time" amount={-3} left={"55%"} top={"75%"} adjustVisible={adjustVisible}></Token>
        </div>
    )
}
  
export default Tokens;