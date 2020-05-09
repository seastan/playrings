import React, {useState, useEffect} from "react";
import Draggable from 'react-draggable';
import cx from "classnames";
import ScoreButton from "../score/ScoreButton";
import GameTeam from "../room/GameTeam";
import useGameUIView from "../../hooks/useGameUIView";
import { GamePlayer, Group, Card, DragEvent } from "elixir-backend";
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import Example from './example/example'
import Chat from "../chat/Chat";
import { faHome, faGripLines, faArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { url } from "inspector";


interface Props {
  emphasizeBidding?: boolean;
  topCard?: null | string;
  bottomCard?: null | string;
  leftCard?: null | string;
  rightCard?: null | string;
  leftPlayer: GamePlayer;
  topPlayer: GamePlayer;
  rightPlayer: GamePlayer;
  bottomPlayer: GamePlayer;
  groupTable: Group;
  broadcast: (eventName: string, payload: object) => void;
}

const qNull = (input: number | null) => {
  if (input == null) {
    return "?";
  }
  return input;
};

export const Table: React.FC<Props> = ({
  leftCard,
  topCard,
  rightCard,
  bottomCard,
  leftPlayer,
  topPlayer,
  rightPlayer,
  bottomPlayer,
  emphasizeBidding,
  groupTable,
  broadcast,
}) => {
  //var draggingDefault = new Array(groupTable.cards.length).fill(false);
  const [dragging, setDragging] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [origin, setOrigin] = useState({x: 0, y: 0});
  const [deltaXY, setDeltaXY] = useState({dx: 0, dy: 0});
  const [tabButtonController, setTabButtonController] = useState("cShared");
  const [tabButtonGroup, setTabButtonGroup] = useState("gSharedQuest");
  const [hoverImage, setHoverImage] = useState("https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/cards/card.jpg");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const gameUIView = useGameUIView();
  //if (!gameUIView) return(null);
  const winner = gameUIView != null ? gameUIView.game_ui.game.winner : null;
  const CARDHEIGHT = 120;
  const CARDWIDTH = 86;
  var maxX = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var maxY = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
  maxX = maxX-90;
  maxY = maxY-90;
  const cardGroups = gameUIView != null ? gameUIView.game_ui.game.groups: null;
  const cardsTable = cardGroups?.table;
  const cardsPlayer1Hand    = cardGroups?.player_1_hand;
  const cardsPlayer1Deck    = cardGroups?.player_1_deck;
  const cardsPlayer1Discard = cardGroups?.player_1_discard;
  const cardsPlayer1Sideboard = cardGroups?.player_1_sideboard;
 
 // document.addEventListener("dragenter", function( event : any ) {
  //   // highlight potential handleDrop target when the draggable element enters it
  //   // if ( event && event.target && event.target.className == "tabContainer" ) {
  //   //     event.target.style.background = "purple";
  //   // }
  //   var t = event.target;
  //   console.log(t);
  //   t.classList.add("drophighlight");
  // }, false);

  const listControllers: [string, string][] = [
    ["cShared", "Shared"],
    ["cPlayer1", "Player 1"],
    ["cPlayer2", "Player 2"],
    ["cPlayer3", "Player 3"],
    ["cPlayer4", "Player 4"]
  ]

  var listGroups: [string, string, string][] = [
    ["cShared", "gSharedQuest", "Quest"],
    ["cShared", "gSharedQuestDiscard", "Quest Discard"],
    ["cShared", "gSharedEncounter", "Encounter"],
    ["cShared", "gSharedEncounterDiscard", "Encounter Discard"],
    ["cShared", "gSharedQuest2", "Quest 2"],
    ["cShared", "gSharedQuestDiscard2", "Quest Discard 2"],
    ["cShared", "gSharedEncounter2", "Encounter 2"],
    ["cShared", "gSharedEncounterDiscard2", "Encounter Discard 2"],
    ["cShared", "gSharedOther", "Other"]
  ]

  const players = [1,2,3,4];
  for (let i of players) {
    console.log(i);
    listGroups.push([`cPlayer${i}`,`gPlayer${i}Hand`,`Player ${i} Hand`]);
    listGroups.push([`cPlayer${i}`,`gPlayer${i}Deck`,`Player ${i} Deck`]);
    listGroups.push([`cPlayer${i}`,`gPlayer${i}Discard`,`Player ${i} Discard`]);
    listGroups.push([`cPlayer${i}`,`gPlayer${i}Sideboard`,`Player ${i} Sideboard`]);
  }

  // useEffect(() => {
  //   console.log('Updated x/y!');
  //   console.log(drag_x);
  //   console.log(drag_y);
  //   var element = document.getElementById(drag_id);
  //   console.log(element);
  //   if (element) {
  //   console.log(element.style.transform);
  //     var new_transform = "rotate(50px)"; //"translate("+drag_x+"px"+(drag_y-100)+"px"+")"
  //     element.style.transform = new_transform;
  //     //element.style.left = drag_x+"px";
  //     //element.style.top = drag_y+"px";
  //     console.log(element);
  //   }
  // }, [drag_id, drag_x, drag_y]);

  //var dragging = false;
  // var cardx = 0;
  // var cardy = 0;
  // const handleDragStop = (e: any, drag_data: any) => {
  //   // setCardX(drag_data.x);
  //   // setCardY(drag_data.y);
  //   console.log("table handleDragStop");
  //   // console.log(drag_data);
  //   // console.log(e);    
  //   var element = drag_data.node;
  //   // console.log(element);
  //   // console.log(element.id);
  //   // console.log(element.style);
  //   // console.log(element.style.transform);
  //   //var drag_event = new DragEvent();
  //   // drag_event.element = element; 
  //   broadcast("drag_card", { drag_id: element.id, drag_x:drag_data.x, drag_y:drag_data.y } );
  //   setTimeout(() => { console.log("timeout"); setDragging(false); }, 500);
  //   //element.style.transform = "translate(84px, 19px)";
  // };  
  // const handleDrag = (e: any, drag_data: any) => {
  //   // setCardX(drag_data.x);
  //   // setCardY(drag_data.y);
  //   // const index = drag_data.node.id.toString();
  //   // var set_dragging = draggingDefault;
  //   // set_dragging[index] = true; 
  //   // setDragging(set_dragging);
    
  //   //cardx = position.x;
  //   //console.log(cardx);
  //   //cardy = position.y;
  //   //dragging = true;
  //   //console.log(dragging);
  //   //broadcast("drag_card", {card: cards[0], cardx: position.x, cardy: position.y} )
  // };
  // const handleDrop = (e: any) => {
  //   console.log('dropped')
  //   e.preventDefault();
  //   e.stopPropagation();
  // };  
  // const handleMouseEnter = (e: any) => {
  //   console.log('mouseover')
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  function makeTabs() {
    return(
      <Draggable handle="strong">
        <div 
          className="bg-gray-700"
          style={{position:"absolute",width:"1300px",height:"230px",top:"72%",left:"2%",display:"flex",flexDirection:"column"}}
        >
          {/* <div className="tab bg-yellow-900 flex-1"> */}
            {makeTabContainer(listGroups)}
          {/* </div> */}
          <div className="fixed bottom-0 w-full">
          <div className="tab bg-gray-900">
            {makeTabButtonGroup(listGroups)}
          </div>
          <div className="tab bg-gray-900">
            <strong className="p-4"><FontAwesomeIcon className="text-white" icon={faGripLines}/></strong>
            {makeTabButtonController(listControllers)}
          </div>
          </div>
        </div>
      </Draggable>
  )}

  function makeTabButtonController(list: [string,string][]) {
    return(
      <>
        {list.map(function([controllerID,controllerName]) {
          return(
            <button 
              className={cx({
                "tablinks": true,
                "active": tabButtonController === controllerID
              })} 
              onClick={() => setTabButtonController(controllerID)}
              onDragEnter={() => setTabButtonController(controllerID)}
            >
              {controllerName}
            </button>
        )})}
      </>
  )}

  function makeTabButtonGroup(list: [string,string,string][]) {
    return(
      <>
        {list.map(function([controllerID,groupID,groupName]) {
          return(
            <button 
              className={cx({
                "tablinks": true,
                "active": (tabButtonController === controllerID && tabButtonGroup === groupID)
              })}
              style={{display: (tabButtonController === controllerID) ? "inline" : "none"}}
              onClick={() => setTabButtonGroup(groupID)}
              onDragEnter={() => setTabButtonGroup(groupID)}
            >
              {groupName}
            </button>
        )})}
      </>
  )}

  function makeTabContainer(list: [string,string,string][]) {
    return (
      <>
        {list.map(function([controllerID,groupID,groupName]) {
          return(
            <div 
              id={groupID}
              className="tabContainer flex-1"
              style={{display: (tabButtonController === controllerID && tabButtonGroup === groupID) ? "block" : "none"}}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={() => console.log("dragover")}
          >{groupName}
          
          {cardsTable?.cards.map((card,index) => {
          return(
            <div          
              className="card"
              style={{
                height:`${CARDHEIGHT}px`, 
                width:`${CARDWIDTH}px`,
              }}
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              draggable="true" 
              id={`column${index}`}
            >
              <div
                className="card"
                style={{
                  height:`${CARDHEIGHT}px`, 
                  width:`${CARDWIDTH}px`,
                  left:`${Math.max(index*10),CARDWIDTH*index}px`,
                  backgroundImage: "url(https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Conflict-at-the-Carrock/Song-of-Wisdom.jpg)",
                  // Drag image around instead of ghost
                  // transform: dragging? "scale(1.0, 1.0) rotateX(0deg) translate3d("+deltaXY.dx+"px, "+deltaXY.dy+"px, 0px)": ""
                }}
                id={`card${index}`}
                draggable="false" 
              ></div>
            </div>
          )
        })}
          
          
          
          </div>
        )})}
      </>
  )}

  function handleDragStart (event: any) {
    setDragging(true);
    var style = window.getComputedStyle(event.target, null);
    setOrigin({x:event.clientX,y:event.clientY});
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY) + ',' + event.target.id;
    console.log(str);
    event.dataTransfer.setData("Text", str);

    // Overwrite drag image to hide ghost
    // var img = new Image();
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    // event.dataTransfer.setDragImage(img, 0, 0);
  }
  
  function handleDragEnd(event: any) {
    // const demoElement: HTMLElement | null = document.getElementById('demo');
    // if (demoElement) {
    //   demoElement.innerHTML = "Finished dragging the p element.";
    // }
  }

  function handleDragEnter(event: any) {
    event.preventDefault();
    var t = event.target;
    console.log(t);
    console.log(tabButtonController,tabButtonGroup);
    t.classList.add("drophighlight");
  }

  function handleDragLeave(event: any) {
    var t = event.target;
    console.log(t);
    t.classList.remove("drophighlight");
  }
  
  function handleDragOver(event: any) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'over';
    // var t = event.target;
    // console.log(t);

    // Physically drag the card instead of using the D&D ghost
		if ( dragging ) {
      var x = event.clientX;
      var y = event.clientY;
      if (x>maxX) x = maxX;
      if (y>maxY) y = maxY;
      const dx = x - origin.x;
      const dy = y - origin.y;
      setDeltaXY({dx, dy});
/*       const draggedCard = document.getElementById("test1");
  */     
/*       if (activeCard != null) {
			  activeCard.style.cssText = css;
      } */
/* 			if ( siblings.length ) {
				each(siblings, function(i, card) {
					card.style.cssText = css;
				}, this);
			} */
		}	
  }
  
  function handleDrop(event: any) {
    // event.preventDefault();
    // var data = event.dataTransfer.getData("Text");
    // console.log(event.dataTransfer);
    // console.log(typeof event);
    // event.target.appendChild(document.getElementById(data));
    var offset = event.dataTransfer.getData("Text").split(',');
    var dm = document.getElementById(offset[2]);
    console.log(dm);
    if (dm) {
      var x = event.clientX + parseInt(offset[0], 10);
      var y = event.clientY + parseInt(offset[1], 10);
      if (x>maxX) x = maxX;
      if (y>maxY) y = maxY;
      dm.style.left = `${x}px`;
      dm.style.top  = `${y}px`;
    }
    setDeltaXY({dx:0,dy:0})
    setTimeout(() => { console.log("timeout"); setDragging(false); }, 100);
    event.preventDefault();
    return false;
  }

  function handleMouseOver(event: any) {
    const imgURL = event.target.style.backgroundImage.slice(4, -1).replace(/"/g, "");
    setHoverImage(imgURL);
  }

  function handleMouseLeave(event: any) {
    setHoverImage("https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/cards/card.jpg");
  }

  const cards = groupTable.cards;
  return (
      <div
        className="droptarget flex-1"
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
        //style={{position: "absolute"}}
      >              
 
        {/* Chat */}
        {gameUIView != null && (
          <Draggable handle="strong" positionOffset={{x:"495%",y:"0%"}}>
            <div className="opacity-90 w-full lg:w-1/6 xl:w-1/6 mb-4">
              <div className="bg-gray-900 max-w-none p-2 mx-auto mt-4">
                <div className="text-center">
                  <strong><FontAwesomeIcon className="text-white" icon={faGripLines}/></strong>
                </div>
                <Chat roomName={gameUIView.game_ui.game_name} />
              </div>
            </div>
          </Draggable>
        )}
        {/* Hover image */}
        <Draggable positionOffset={{x:"495%",y:"0%"}}>
          <div className="opacity-90 w-full lg:w-1/6 xl:w-1/6 mb-4">
            <div className="max-w-none p-2 mx-auto mt-4 ">
              <img
                draggable="false" 
                id="display"
                style={{width:"100%"}}
                src={hoverImage}>
              </img>
            </div>
          </div>
        </Draggable>


        {cardsTable?.cards.map((card,index) => {
          return(
            <div          
              className="card"
              style={{
                height:`${CARDHEIGHT}px`, 
                width:`${CARDWIDTH}px`,
              }}
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              draggable="true" 
              id={`column${index}`}
            >
              <div
                className="card"
                style={{
                  height:`${CARDHEIGHT}px`, 
                  width:`${CARDWIDTH}px`,
                  background: "white",
                  backgroundImage: "url(https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Conflict-at-the-Carrock/Song-of-Wisdom.jpg)",
                  // Drag image around instead of ghost
                  // transform: dragging? "scale(1.0, 1.0) rotateX(0deg) translate3d("+deltaXY.dx+"px, "+deltaXY.dy+"px, 0px)": ""
                }}
                id={`card${index}`}
                draggable="false" 

              ></div>
            </div>
          )
        })}



      

        {/* Hands */}
        {makeTabs()}
 

        {/* <img
          className={cx({
            "dropitem h-32 object-cover -ml-16 z-30": true,
            "hand-card-animate": !dragging
            //"hand-card-selected": dragging
          })}
          style={{height:"120px",transform: dragging? "scale(1.0, 1.0) rotateX(0deg) translate3d("+deltaXY.dx+"px, "+deltaXY.dy+"px, 0px)": ""}}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          draggable="true" 
          id="card1"
          src="https://images-cdn.fantasyflightgames.com/filer_public/83/8b/838b34bc-9188-4311-b04a-33dab2a527e0/mec82_gwaihir.png">
        </img> */}
      </div>
  )}

  //     {cards.map((card,index) => {
  //       // let cardStr = cardToString(card);




  //       return (

  //       )
  //     })
  // );

            {/* <p id="demo"></p>
            <img 
              id={index.toString()} 
              draggable={false} 
              onMouseOver={() => {
                setSelectedCard(index);
              }}            
              onMouseLeave={() => {
                setSelectedCard(null);
              }}
              className={cx({
                "h-32 object-cover -ml-16 z-30": true,
                "hand-card-animate": dragging[index]? false : true,
                "hand-card-selected": selectedCard === index
              })}
              src="https://images-cdn.fantasyflightgames.com/filer_public/83/8b/838b34bc-9188-4311-b04a-33dab2a527e0/mec82_gwaihir.png">
            </img>
        );
      })}

        <img src="https://images-na.ssl-images-amazon.com/images/I/31sIPsH0CRL._AC_.jpg"></img>
      </div> */}

{/*  
    <div className="h-full w-full relative">
      {winner && (
        <div className="p-6 w-full h-full absolute inset-0 z-40">
          <div className="p-3 bg-white border rounded w-full h-full">
            <h2 className="text-purple-800 font-semibold mb-4">Winner!</h2>
            <div className="mb-2">
              Team:{" "}
              <span className="font-semibold">
                {winner === "east_west" && <GameTeam isEastWest />}
                {winner === "north_south" && <GameTeam isNorthSouth />}
              </span>{" "}
              won.
            </div>
            <ScoreButton />
          </div>
        </div>
      )}
      <div className="h-56 bg-orange-200 border rounded-lg shadow-lg">
        //  Top row/card 
        <div className="absolute inset-x-0 top-0 h-0 p-1 flex">
          <div className="mx-auto flex">
            <div className="w-20 px-2 text-right text-sm">
              <span className={cx(bidClasses)}>
                Bid: {qNull(topPlayer.bid)}
              </span>
              <br />
              Tricks: {qNull(topPlayer.tricks_won)}
            </div>
            {topCard && (
              <img
                src={topCard}
                alt=".."
                className={cardHeight + " object-cover rotate-1/2"}
              />
            )}
            <div className="w-20"></div>
          </div>
        </div>

        // Bottom row/card
        <div className="absolute inset-x-0 bottom-0 h-0 p-1 flex">
          <div className="mx-auto flex -mt-24 items-end">
            <div className="w-20"></div>
            {bottomCard && (
              <img
                src={bottomCard}
                alt=".."
                className={cardHeight + " object-cover"}
              />
            )}
            <div className="w-20 px-2 text-sm">
              <span className={cx(bidClasses)}>
                Bid: {qNull(bottomPlayer.bid)}
              </span>
              <br />
              Tricks: {qNull(bottomPlayer.tricks_won)}
            </div>
          </div>
        </div>

        // Left row/card
        <div className="absolute inset-y-0 left-0 p-1 flex">
          <div className="my-auto flex flex-col">
            <div className="h-12"></div>
            <div className="h-24 ml-4">
              {leftCard && (
                <img
                  src={leftCard}
                  alt=".."
                  className={cardHeight + " object-cover rotate-1/4"}
                />
              )}
            </div>
            <div className="h-12 text-sm -mt-4 mb-4">
              <span className={cx(bidClasses)}>
                Bid: {qNull(leftPlayer.bid)}
              </span>
              <br />
              Tricks: {qNull(leftPlayer.tricks_won)}
            </div>
          </div>
        </div>

        // Right row/card
        <div className="absolute inset-y-0 right-0 p-1 flex">
          <div className="my-auto flex flex-col">
            <div className="h-12 mt-4 -mb-4 flex items-end">
              <div className="text-right w-full text-sm pb-1">
                <span className={cx(bidClasses)}>
                  Bid: {qNull(rightPlayer.bid)}
                </span>
                <br />
                Tricks: {qNull(rightPlayer.tricks_won)}
              </div>
            </div>
            <div className="h-24 mr-4">
              {rightCard && (
                <img
                  src={rightCard}
                  alt=".."
                  className={cardHeight + " object-cover rotate-3/4"}
                />
              )}
            </div>
            <div className="h-12"></div>
          </div>
        </div>
      </div>
    </div> */}
    {/* </div>
  ); */}

export default Table;
