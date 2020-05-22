import React, {useState, useEffect} from "react";
import Draggable from 'react-draggable';
import cx from "classnames";
import ScoreButton from "../score/ScoreButton";
import GameTeam from "../room/GameTeam";
import useGameUIView from "../../hooks/useGameUIView";
import { GamePlayer, Group, Groups, Card, DragEvent, GameUIView } from "elixir-backend";
import Chat from "../chat/Chat";
import { faHome, faGripLines, faArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { url } from "inspector";


interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const qNull = (input: number | null) => {
  if (input == null) {
    return "?";
  }
  return input;
};

export const Table: React.FC<Props> = ({
  gameUIView,
  broadcast,
}) => {
  //var draggingDefault = new Array(groupTable.cards.length).fill(false);
  const [dragging, setDragging] = useState(false);
  const [activeContainerIndices, setActiveContainerIndices] = useState<Array<number>>([]);
  const [activeCardIndices, setActiveCardIndices] = useState<Array<number>>([]);
  const [origin, setOrigin] = useState({x: 0, y: 0});
  const [deltaXY, setDeltaXY] = useState({dx: 0, dy: 0});
  const [tabButtonController, setTabButtonController] = useState("cShared");

  const [underHoverGroupID, setUnderHoverGroupID] = useState("");
  const [underHoverIndex, setUnderHoverIndex] = useState<number>(-1);
  const [ghostCard, setGhostCard] = useState<Card | null>(null);
  const [ghostGroupID, setGhostGroupID] = useState("");
  const [ghostIndex, setGhostIndex] = useState(0);

  const [tabButtonGroup, setTabButtonGroup] = useState("gSharedQuest");
  const [hoverImage, setHoverImage] = useState("https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/cards/card.jpg");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  //const gameUIView = useGameUIView();
  //if (!gameUIView) return(null);
  const winner = gameUIView != null ? gameUIView.game_ui.game.winner : null;
  const CARDHEIGHT = 120;
  const CARDWIDTH = 86;
  const TABSWIDTH = 1300;
  const GROUPXOFFSET = 20;
  const GROUPYOFFSET = 20;
  var maxX = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var maxY = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
  maxX = maxX-90;
  maxY = maxY-90;
  const groups = gameUIView.game_ui.game.groups;
  const groupIDs: string[] = [
    "gSharedQuest",
    "gSharedQuestDiscard",
    "gSharedEncounter",
    "gSharedEncounterDiscard",
    "gSharedQuest2",
    "gSharedQuestDiscard2",
    "gSharedEncounter2",
    "gSharedEncounterDiscard2",
    "gSharedOther",
    "gSharedVictory",
    "gPlayer1Hand",
    "gPlayer1Deck",
    "gPlayer1Discard",
    "gPlayer1Sideboard",
    "gPlayer2Hand",
    "gPlayer2Deck",
    "gPlayer2Discard",
    "gPlayer2Sideboard",
    "gPlayer3Hand",
    "gPlayer3Deck",
    "gPlayer3Discard",
    "gPlayer3Sideboard",
    "gPlayer4Hand",
    "gPlayer4Deck",
    "gPlayer4Discard",
    "gPlayer4Sideboard"
  ];
  const columns = gameUIView.game_ui.game.columns;
 
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
          style={{position:"absolute",width:`${TABSWIDTH}px`,height:"230px",top:"72%",left:"2%",display:"flex",flexDirection:"column"}}
        >
          {/* <div className="tab bg-yellow-900 flex-1"> */}
            {makeTabContainer()}
          {/* </div> */}
          <div className="fixed bottom-0 w-full">
          <div className="tab bg-gray-900">
            {makeTabButtonGroup()}
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

  function makeTabButtonGroup() {
    return(
      <>
        {groupIDs.map(function(groupID: string) {
          return(
            <button 
              className={cx({
                "tablinks": true,
                "active": (tabButtonController === groups[groupID].controller && tabButtonGroup === groupID)
              })}
              style={{display: (tabButtonController === groups[groupID].controller) ? "inline" : "none"}}
              onClick={() => setTabButtonGroup(groupID)}
              onDragEnter={() => setTabButtonGroup(groupID)}
            >
              {groups[groupID].name}
            </button>
        )})}
      </>
  )}

  function makeTabContainer() {
    return (
      <>
        {groupIDs.map(function(groupID: string) {
          const numcards = groups[groupID].cards.length
          const spacing = Math.min(CARDWIDTH*0.99,(TABSWIDTH-CARDWIDTH)/numcards); 
          return(
            <div 
              id={`${groupID}TabContainer`}
              data-group={groupID}
              data-type="tabContainer"
              className="tabContainer flex-1 m-3"
              style={{display: (tabButtonController === groups[groupID].controller && tabButtonGroup === groupID) ? "block" : "none"}}
              //onDragEnter={handleDragEnter}
              //onDragLeave={handleDragLeave}
          >
          


          {groups[groupID].cards.map((card: Card,index: number) => {
            var left = GROUPXOFFSET+index*spacing;
            //if (ghostGroupID == groupID && ghostIndex < index) left = left - spacing;
            //if (outlineID === `${groupID}Container${index}`) left = left+20;
            console.log()
            return(
              <div          
                className="cardContainer"
                style={{
                  height:`${CARDHEIGHT}px`, 
                  width:`${CARDWIDTH}px`,
                  left:`${left}px`,
                  position:"absolute",
                  top:`${GROUPXOFFSET}px`,
                  display: (groupID === ghostGroupID && index === ghostIndex) ? "none" : "block",
                }}
                data-type="cardContainer"
                data-group={groupID}
                data-index={index}
                id={`${groupID}CardContainer${index}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                //onDragOver={handleDragOver}
              >

                <div
                  className="outline border-dashed border-4 border-gray-600"
                  style={{
                    height:`${CARDHEIGHT}px`, 
                    width:`${CARDWIDTH}px`,
                    left:`0px`,
                    top:`0px`,
                    position: "relative",
                    //background: "white",
                    backgroundSize: "100%",
                    float:"left",
                    // display: (outlineID === `${groupID}Container${index}`) ? "block" : "none",
                    display: (
                      groupID === underHoverGroupID && 
                      index == underHoverIndex
                      && (underHoverIndex != ghostIndex || underHoverGroupID != ghostGroupID)
                      ) ? "block" : "none",
                  }}
                  id={`${groupID}CardContainer${index}Outline`}
                  // onDragStart={handleDragStart} 
                  // onDragEnd={handleDragEnd}
                  // onMouseOver={handleMouseOver}
                  // onMouseLeave={handleMouseLeave}
                  data-type="outline"
                  draggable="false"  
                ></div>
                <div
                  className="card"
                  style={{
                    height:`${CARDHEIGHT}px`, 
                    width:`${CARDWIDTH}px`,
                    left: (
                      groupID === underHoverGroupID && 
                      index >= underHoverIndex 
                      && (underHoverIndex != ghostIndex || underHoverGroupID != ghostGroupID)
                      ) ? `${spacing}px` : "0px",
                    top:`0px`,
                    position: "relative",
                    background: `url(${card.src}) no-repeat center center / 100%`,
                    //backgroundSize: "100%",
                    opacity: (groupID === ghostGroupID && index == ghostIndex) ? "30%" : "100%"
                    //display: (groupID === ghostGroupID && index == ghostIndex) ? "none" : "block",
                    // Drag image around instead of ghost
                    // transform: dragging? "scale(1.0, 1.0) rotateX(0deg) translate3d("+deltaXY.dx+"px, "+deltaXY.dy+"px, 0px)": ""
                  }}
                  id={`${groupID}CardContainer${index}Card`}
                  onDragStart={handleDragStart} 
                  onDragEnd={handleDragEnd}
                  onMouseOver={handleMouseOver}
                  onMouseLeave={handleMouseLeave}
                  data-type="card"
                  data-group={groupID}
                  draggable="true"  
                ></div>
              </div>
          )})}
          
          <div
            className="outline border-dashed border-4 border-gray-600"
            style={{
              height:`${CARDHEIGHT}px`, 
              width:`${CARDWIDTH}px`,
              left:`${GROUPXOFFSET+numcards*spacing}px`,
              top:`${GROUPXOFFSET}px`,
              position: "absolute",
              //background: "white",
              backgroundSize: "100%",
              float:"left",
              // display: (outlineID === `${groupID}Container${index}`) ? "block" : "none",
              display: (
                groupID === underHoverGroupID &&
                underHoverIndex == numcards)
                // && (underHoverIndex != ghostIndex || underHoverGroupID != ghostGroupID)
                // ) 
                ? "block" : "none",
            }}
            id={`${groupID}EndOutline`}
            // onDragStart={handleDragStart} 
            // onDragEnd={handleDragEnd}
            // onMouseOver={handleMouseOver}
            // onMouseLeave={handleMouseLeave}
            data-type="outline"
            draggable="false"  
          ></div>
          
          </div>
        )})}
      </>
  )}

  function handleDragStart (event: any) {
    setDragging(true);
    var style = window.getComputedStyle(event.target, null);
    setOrigin({x:event.clientX,y:event.clientY});
    var str =   
      event.target.id + ',' + // Card div id
      event.target.parentNode.id + ',' + // Container div id
      event.target.parentNode.parentNode.id + ',' + // Group div id
      (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + 
      (parseInt(style.getPropertyValue("top")) - event.clientY);
    console.log(str);
    event.dataTransfer.setData("Text", str);
    const groupID = event.target.dataset.group;
    const card_index = event.target.dataset.index;
    const container_index = event.target.parentNode.dataset.index;
    const card = groups[groupID].cards[container_index];
    setGhostGroupID(groupID);
    setGhostIndex(container_index);
    setGhostCard(card);
    setActiveContainerIndices([container_index]);
    setActiveCardIndices([card_index]);

    // Overwrite drag image 
    // var dragIcon = document.createElement("img");
    // dragIcon.src = card.src;
    // dragIcon.style.width = `${CARDWIDTH}px`;
    // var div = document.createElement('div');
    // div.appendChild(dragIcon);
    // div.style.position = "absolute"; div.style.top = "0px"; div.style.left= "-500px";
    // document.querySelector('body')?.appendChild(div);
    // event.dataTransfer.setDragImage(div, 0, 0);
    // //img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
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
    console.log("dragenter:"+t.id);
    //t.classList.add("drophighlight");
  }

  function handleDragLeave(event: any) {
    var t = event.target;
    console.log("dragleave:"+t.id);
    setUnderHoverGroupID("");      
    setUnderHoverIndex(-1);
    //t.classList.remove("drophighlight");      
    //setOutlineGroupID("");      
    //setOutlineIndex(0);

  }
  
  function handleDragOver(event: any) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'over';
    var t = event.target;
    console.log("dragover:"+underHoverGroupID);
    console.log("dragover:"+underHoverIndex);

    if (t.parentNode.dataset.type == "cardContainer") {
      setUnderHoverGroupID(t.parentNode.dataset.group);
      setUnderHoverIndex(Number(t.parentNode.dataset.index));
    } else if (t.dataset.type == "cardContainer") {
      setUnderHoverGroupID(t.dataset.group);
      setUnderHoverIndex(Number(t.dataset.index));
    } else if (t.dataset.type == "tabContainer") {
      setUnderHoverGroupID(t.dataset.group);
      setUnderHoverIndex(groups[underHoverGroupID]?.cards.length);
    }


    // Physically drag the card instead of using the D&D 
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
    console.log(ghostGroupID);
    console.log(ghostIndex);
  }
  
  function handleDrop(event: any) {

    // event.preventDefault();
    // var data = event.dataTransfer.getData("Text");
    // console.log(event.dataTransfer);
    // console.log(typeof event);
    // event.target.appendChild(document.getElementById(data));
    const drag_data = event.dataTransfer.getData("Text").split(',');
    const origin_card_id = drag_data[0];
    const origin_container_id = drag_data[1];
    const origin_group_id = drag_data[2];
    const container = document.getElementById(origin_container_id);
    //console.log(dm);
    console.log(event);
    var x: number = 0;
    var y: number = 0;
    if (container) {
      x = event.clientX + parseInt(drag_data[3], 10);
      y = event.clientY + parseInt(drag_data[4], 10);
      if (x>maxX) x = maxX;
      if (y>maxY) y = maxY;
      //container.style.left = `${x}px`;
      //container.style.top  = `${y}px`;
    }
    broadcast("drag_cards", { 
      source_group_id:ghostGroupID,
      source_indices:activeContainerIndices,
      dest_group_id:underHoverGroupID,
      dest_index:underHoverIndex,
      drag_x:x, 
      drag_y:y 
    });
    setDeltaXY({dx:0,dy:0})
    setUnderHoverGroupID("");      
    setUnderHoverIndex(-1);
    setGhostCard(null);
    setGhostGroupID("");
    setGhostIndex(0);

    setTimeout(() => { 
      console.log("timeout"); 
      setDragging(false); 
    }, 100);
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


        {columns.map((column,index) => {
          return(
            <div          
              className="column"
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
 
      </div>
  )}


export default Table;
