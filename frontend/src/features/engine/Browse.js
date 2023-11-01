import React, { useContext, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Stacks } from "./Stacks";
import { useBrowseTopN } from "./hooks/useBrowseTopN";
import { setValues } from "../store/gameUiSlice";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setBrowseGroupId, setDropdownMenu, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useDoActionList } from "./hooks/useDoActionList";
import { useLayout } from "./hooks/useLayout";
import { convertToPercentage, getParentCardsInGroup } from "./functions/common";

const isNormalInteger = (val) => {
  var n = Math.floor(Number(val));
  return n !== Infinity && n === val && n >= 0;
}

export const Browse = React.memo(({addDroppableRef}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const dispatch = useDispatch();
  const gameL10n = useGameL10n();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const groupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const browseGroupTopN = useSelector(state => state?.playerUi?.browseGroup?.topN);
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const layout = useLayout();
  var region = layout?.browse;
  const browseWidth = convertToPercentage(region.width);
  const regionWidthInt = parseInt(browseWidth.substring(0, browseWidth.length - 1))
  region = {...region, groupId: groupId, width: `${regionWidthInt*0.7}%`}
  const game = useSelector(state => state?.gameUi?.game);
  const parentCards = getParentCardsInGroup(game, groupId);
  const [searchForProperty, setSearchForProperty] = useState('All');
  const [searchForText, setSearchForText] = useState('');
  const stackIds = group?.["stackIds"] || [];
  const numStacks = stackIds.length;
  const browseTopN = useBrowseTopN();
  const doActionList = useDoActionList();
  var filterButtons = gameDef?.browse?.filterValuesSideA;
  filterButtons = ["All", ...filterButtons, "Other"];
  var pairedFilterButtons = filterButtons?.reduce((acc, curr, i) => {
    if (i % 2 === 0) {
      acc.push([curr, filterButtons[i + 1]]);
    }
    return acc;
  }, [])

  if (!group) return;
  console.log("Rendering Browse", groupId, region, browseGroupTopN)

  const handleBarsClick = (event) => {
    event.stopPropagation();
    const dropdownMenu = {
        type: "group",
        group: group,
        title: gameL10n(gameDef.groups[groupId].label)
    }
    dispatch(setDropdownMenu(dropdownMenu));
  }

  // This allows the deck to be hidden instantly upon close (by hiding the top card)
  // rather than waiting to the update from the server
  const stopPeekingTopCard = () => {
    if (numStacks === 0) return null;
    const stackId0 = stackIds[0];
    const cardIds = game["stackById"][stackId0]["cardIds"];
    const cardId0 = cardIds[0];
    const updates = [["game", "cardById", cardId0, "peeking", playerN, false]];
    dispatch(setValues({updates: updates})) 
  }

  const handleCloseClick = (option) => {
    if (playerN) {
      if (option === "shuffle") closeAndShuffle();
      else if (option === "order") closeAndOrder();
      else if (option === "peeking") closeAndPeeking();
    }
    dispatch(setBrowseGroupId(null));
    setSearchForText('');
    setSearchForProperty('All');
  }

  const closeAndShuffle = () => {
    const actionList = [
      ["LOG", "$ALIAS_N", " closed ", gameL10n(group.label)+"."],
      ["FOR_EACH_VAL", "$STACK_ID", `$GROUP_BY_ID.${groupId}.stackIds`,
        [
          ["DEFINE", "$CARD_ID", "$STACK_BY_ID.$STACK_ID.cardIds.[0]"],
          ["SET", "/cardById/$CARD_ID/peeking/$PLAYER_N", false]
        ]
      ],
      ["LOG", "$ALIAS_N", " shuffled ", gameL10n(group.label)+"."],
      ["SHUFFLE_GROUP", groupId]
    ];
    doActionList(actionList);
    if (group?.onCardEnter?.currentSide === "B") stopPeekingTopCard();
  }

  const closeAndOrder = () => {
    const actionList = [
      ["LOG", "$ALIAS_N", " closed ", gameL10n(group.label)+"."],
      ["FOR_EACH_VAL", "$STACK_ID", `$GROUP_BY_ID.${groupId}.stackIds`,
        [
          ["DEFINE", "$CARD_ID", "$STACK_BY_ID.$STACK_ID.cardIds.[0]"],
          ["SET", "/cardById/$CARD_ID/peeking/$PLAYER_N", false]
        ]
      ]
    ];
    doActionList(actionList);
    if (group?.onCardEnter?.currentSide === "B") stopPeekingTopCard();
  }

  const closeAndPeeking = () => {
    const actionList = [
      ["LOG", "$ALIAS_N", " is still peeking at ", gameL10n(group.label)+"."],
    ];
    doActionList(actionList);
  }

  const handleSelectClick = (event) => {
    const topNstr = event.target.value;
    browseTopN(group.id, topNstr)
  }

  const handleInputTyping = (event) => {
    setSearchForText(event.target.value);
  }

  // If browseGroupTopN not set, or equal to "All" or "None", show all stacks
  var browseGroupTopNint = isNormalInteger(browseGroupTopN) ? parseInt(browseGroupTopN) : numStacks;
  if (browseGroupTopNint < 0) browseGroupTopNint = numStacks;
  var filteredStackIndices = [...Array(browseGroupTopNint).keys()];
  
  // Filter by selected card type
  if (searchForProperty === "Other") {
      filteredStackIndices = filteredStackIndices.filter((stackIndex) => {
        const stackId = stackIds[stackIndex];
        const propertyValue = parentCards[stackIndex]?.sides?.A?.[gameDef?.browse?.filterPropertySideA];
        const isValueOther = !gameDef?.browse?.filterValuesSideA?.includes(propertyValue);
        const isPeekingOrCurrentSideA = (
          parentCards[stackIndex].peeking[playerN] || 
          parentCards[stackIndex].currentSide === "A"
        );
        return stackId && isPeekingOrCurrentSideA && isValueOther
      });
  } else if (searchForProperty !== "All") 
    filteredStackIndices = filteredStackIndices.filter((stackIndex) => (
      stackIds[stackIndex] && 
      parentCards[stackIndex]?.sides?.A?.[gameDef?.browse?.filterPropertySideA] === searchForProperty &&
      (parentCards[stackIndex]?.peeking?.[playerN] || parentCards[stackIndex]?.currentSide === "A") 
  ));  

  if (searchForText) {
    const properties = gameDef.browse.textPropertiesSideA;
    filteredStackIndices = filteredStackIndices.filter((stackIndex) => {
      const stackId = stackIds[stackIndex];
      const card = parentCards[stackIndex]?.sides?.A;
      const isCardMatching = properties.some((prop) =>
        card?.[prop]?.toLowerCase().includes(searchForText.toLowerCase())
      );
      const isPeekingOrCurrentSideA = (
        parentCards[stackIndex].peeking[playerN] || 
        parentCards[stackIndex].currentSide === "A"
      );
      return stackId && isCardMatching && isPeekingOrCurrentSideA;
    });
  }

  return(
    <div className="absolute bg-gray-700 w-full" 
      style={{
        left: convertToPercentage(region.left), 
        width: browseWidth, 
        top: convertToPercentage(region.top), 
        height: convertToPercentage(region.height), 
        zIndex: 1e3
      }}>
      <strong className="absolute bg-gray-600 w-full text-gray-300 flex justify-center items-center" style={{top:"-20px", height: "20px"}}>
        <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="cursor-pointer hover:text-white" icon={faBars}/>
        <span className="px-2">{gameL10n(gameDef.groups[group.id].label)}</span>
      </strong>
      

      <div className="h-full float-left " style={{width: "75%"}}>        
        <div
          className="relative h-full float-left select-none text-gray-300"
          style={{width:"17px"}}>
            <div className="relative w-full h-full">
            {region.hideTitle ? null :
              <span 
                className="absolute pb-2 overflow-hidden" 
                style={{fontSize: "1.5vh", top: "50%", left: "50%", transform: `translate(-50%, -70%) rotate(90deg)`, whiteSpace: "nowrap"}}>
                 (Top)
              </span>
            }
            </div>
        </div>
        <Stacks
          groupId={groupId}
          region={region}
          selectedStackIndices={filteredStackIndices}
          addDroppableRef={addDroppableRef}
        />
      </div>
 
      <div className="absolute h-full p-2 select-none" style={{left:"70%", width:"20%"}}>
            
        <div className="h-1/5 w-full">
          <div className="h-full float-left w-1/2 px-0.5">
            <select 
              name="numFaceup" 
              id="numFaceup"
              className="form-control w-full bg-gray-900 text-white border-0 h-full px-1 py-0"
              onChange={handleSelectClick}>
              <option value="" disabled selected>{gameL10n("Peek at...")}</option>
              <option value="None">{gameL10n("None")}</option>
              <option value="All">{gameL10n("All")}</option>
              <option value="5">{gameL10n("Top 5")}</option>
              <option value="10">{gameL10n("Top 10")}</option>
            </select>
          </div>
          <div className="h-full float-left w-1/2 px-0.5">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Search.."
              className="form-control w-full bg-gray-900 text-white border-0 h-full px-1"
              onFocus={event => dispatch(setTyping(true))}
              onBlur={event => dispatch(setTyping(false))}
              onChange={handleInputTyping}
            />
          </div>
        </div>
        {pairedFilterButtons.map((row, rowIndex) => {
          return(
            <div className="w-full text-white text-center" style={{height: `calc(100% / ${pairedFilterButtons.length+1})`}}>
              {row.map((item, itemIndex) => {
                return(
                  <div className="h-full float-left w-1/2 p-0.5">
                    <div className={"h-full w-full flex items-center justify-center hover:bg-gray-600 rounded" + (searchForProperty === item ? " bg-red-800" : " bg-gray-800")}
                      onClick={() => setSearchForProperty(item)}>    
                      {gameL10n(row[itemIndex])}
                    </div>
                  </div>
                )
              })}
          </div>
          )})
        }
      </div>

      <div className="absolute h-full float-left p-1 select-none" style={{left: "90%", width: "10%"}}>
        <div className="h-1/4 w-full text-white text-center">
          <div className="h-full float-left w-full p-0.5">
            <div className="h-full w-full">   
              Close &
            </div>
          </div>
        </div>
        {[["Shuffle", "shuffle"],
          ["Keep order", "order"],
          ["Keep peeking", "peeking"]
          ].map((row, rowIndex) => {
            if (!playerN && row[1] === "shuffle") return;
            if (!playerN && row[1] === "peeking") return; 
            return(
              <div className="h-1/4 w-full text-white text-center">
                <div className="h-full float-left w-full p-0.5">
                  <div className="flex h-full w-full bg-gray-800 hover:bg-gray-600 rounded items-center justify-center"
                    onClick={(event) => handleCloseClick(row[1])}>    
                    {gameL10n(row[0])}
                  </div>
                </div>
              </div>
            )})
          }
      </div>
    </div>
  )
})
