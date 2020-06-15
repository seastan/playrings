import React, { useState, useEffect } from "react";
import { CARDSCALE } from "./Card";

//import cx from "classnames";

const tokenURLs = {
    "threat":    "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/39df75f2-141d-425f-b651-d572b4885004.png",
    "willpower": "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/f24eb0c4-8405-4599-ba80-95bc009ae9fb.png",
    "attack":    "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/53f20b83-6292-4017-abd0-511efdaf710d.png",
    "defense":   "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/6987d1a6-55ab-4ced-bbec-4e5b3490a40e.png",
    "resource":  "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/62a2ba76-9872-481b-b8fc-ec35447ca640.png",
    "damage":    "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/38d55f36-04d7-4cf9-a496-06cb84de567d.png",
    "progress":  "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/e9a419ff-5154-41cf-b84f-95149cc19a2a.png",
    "time":      "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/31627422-f546-4a69-86df-ca0a028f3138.png",
}

export const Token = ({
    type,
    amount,
    left,
    top,
}) => {
    return(
        <div
            style={{
                position: "absolute",
                left: `${left}`,
                top: `${top}`,
                height: `${CARDSCALE/0.7/4}vw`,
                width: `${CARDSCALE/0.7/4}vw`,
                backgroundImage: `url(${tokenURLs[type]})`,
                backgroundSize: "contain",
                zIndex: 1e6,
            }}
        >{amount}
        </div>
    )
  }
  
  export default Token;