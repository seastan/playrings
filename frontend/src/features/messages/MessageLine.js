import React from "react";
import UserName from "../user/UserName";
import { useSelector } from "react-redux";
import { usePlayerIList } from "../engine/hooks/usePlayerIList";
import { useGameDefinition } from "../engine/hooks/useGameDefinition";
import useProfile from "../../hooks/useProfile";
import { getPlayerIColor } from "../engine/functions/common";

export const useMessageTextToHtml = () => {
  const gameDef = useGameDefinition();
  const user = useProfile();
  const language = user?.language || "English";

  return (text) => {
    // Format labels first
    const labelsFormatted = text.replace(/id:([a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)*)/g, function(match, p1) {
      return gameDef?.labels?.[p1]?.[language] || p1;
    });

    const regex = /\[player\d+\/[^\]]+\]/g; // Regex to match the pattern [playerN Name]
    const parts = labelsFormatted.split(regex); // Split the text by these patterns

    // Find all matches for the pattern
    const matches = labelsFormatted.match(regex) || [];

    const aliasFormatted = parts.reduce((acc, part, index) => {
      acc.push(<span key={`text-${index}`}>{part}</span>);

      if (index < matches.length) {
        const match = matches[index];
        const playerIdentifier = match.match(/\[player\d+/)[0].slice(1); // Extracts 'playerN'
        const color = getPlayerIColor(playerIdentifier);
        const newMatch = match.replace("[player", "["); // Removes 'playerN' from the match
        acc.push(
          <span key={`player-${index}`} style={{color: color}}>
            {newMatch}
          </span>
        );
      }

      return acc;
    }, []);
    return aliasFormatted;
  }
};


export const MessageLine = ({ message }) => {
  console.log("Rendering MessageLine",message)
  const cleanText = message?.text ? message.text.replace(/<\/?.+?>/ig, '') : "";
  const messageTextToHtml = useMessageTextToHtml();
  const processedText = messageTextToHtml(cleanText);

  return (
    <div className="ml-2" style={{fontFamily: "monospace", fontSize: "1.4vh"}}>
      <span className="text-white">{processedText}</span>
    </div>
  )

};
export default MessageLine;
