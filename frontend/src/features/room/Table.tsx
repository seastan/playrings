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
  const [viewTab, setViewTab] = useState("shared");
  const [hoverImage, setHoverImage] = useState("https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/cards/card.jpg");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const gameUIView = useGameUIView();
  //if (!gameUIView) return(null);
  const winner = gameUIView != null ? gameUIView.game_ui.game.winner : null;
  const cardHeight = "h-24";
  const bidClasses = {
    "font-semibold text-lg text-blue-800": emphasizeBidding,
  };
  var maxX = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var maxY = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
  maxX = maxX - 120;
  maxY = maxY - 120;

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
  const handleDragStop = (e: any, drag_data: any) => {
    // setCardX(drag_data.x);
    // setCardY(drag_data.y);
    console.log("table handleDragStop");
    // console.log(drag_data);
    // console.log(e);    
    var element = drag_data.node;
    // console.log(element);
    // console.log(element.id);
    // console.log(element.style);
    // console.log(element.style.transform);
    //var drag_event = new DragEvent();
    // drag_event.element = element; 
    broadcast("drag_card", { drag_id: element.id, drag_x:drag_data.x, drag_y:drag_data.y } );
    setTimeout(() => { console.log("timeout"); setDragging(false); }, 500);
    //element.style.transform = "translate(84px, 19px)";
  };  
  const handleDrag = (e: any, drag_data: any) => {
    // setCardX(drag_data.x);
    // setCardY(drag_data.y);
    // const index = drag_data.node.id.toString();
    // var set_dragging = draggingDefault;
    // set_dragging[index] = true; 
    // setDragging(set_dragging);
    
    //cardx = position.x;
    //console.log(cardx);
    //cardy = position.y;
    //dragging = true;
    //console.log(dragging);
    //broadcast("drag_card", {card: cards[0], cardx: position.x, cardy: position.y} )
  };
  const handleDrop = (e: any) => {
    console.log('dropped')
    e.preventDefault();
    e.stopPropagation();
  };  
  const handleMouseEnter = (e: any) => {
    console.log('mouseover')
    e.preventDefault();
    e.stopPropagation();
  };

  function dragStart (event: any) {
    // event.dataTransfer.setData("Text", event.target.id);
    // const demoElement: HTMLElement | null = document.getElementById('demo');
    // if (demoElement) {
    //   demoElement.innerHTML = "Started to drag the p element";
    // }
    setDragging(true);
    var style = window.getComputedStyle(event.target, null);
    setOrigin({x:event.pageX,y:event.pageY});
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY) + ',' + event.target.id;
    console.log(str);
    event.dataTransfer.setData("Text", str);

    // Overwrite drag image to hide ghost
    var img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    event.dataTransfer.setDragImage(img, 0, 0);
  }
  
  function dragEnd(event: any) {
    // const demoElement: HTMLElement | null = document.getElementById('demo');
    // if (demoElement) {
    //   demoElement.innerHTML = "Finished dragging the p element.";
    // }
  }
  
  function handleDragOver(event: any) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'over';

    // Physically drag the card instead of using the D&D ghost
		if ( dragging ) {
      var x = event.pageX;
      var y = event.pageY;
      if (x>maxX) x = maxX;
      if (y>maxY) y = maxY;
      console.log(x,y)
      console.log(window.innerWidth,window.innerHeight)
      const dx = x - origin.x;
      const dy = y - origin.y;
      setDeltaXY({dx, dy});
      console.log(dx,dy)
      const css = "pointer-events: none; transform: scale(1.05, 1.05) rotateX(0deg) translate3d("+dx+"px, "+dy+"px, 0px);";
      const draggedCard = document.getElementById("test1");
      
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
  
  function drop(event: any) {
    // event.preventDefault();
    // var data = event.dataTransfer.getData("Text");
    // console.log(event.dataTransfer);
    // console.log(typeof event);
    // event.target.appendChild(document.getElementById(data));
    var offset = event.dataTransfer.getData("Text").split(',');
    var dm = document.getElementById(offset[2]);
    console.log(dm);
    if (dm) {
      console.log(dm.style.left);
      console.log(event.clientX)
      console.log(offset)
      dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
      console.log(dm.style.left);
      dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    }
    setDeltaXY({dx:0,dy:0})
    setTimeout(() => { console.log("timeout"); setDragging(false); }, 100);
    event.preventDefault();
    return false;
  }

  function handleMouseOver(event: any) {
    console.log(event);
    setHoverImage("https://images-cdn.fantasyflightgames.com/filer_public/83/8b/838b34bc-9188-4311-b04a-33dab2a527e0/mec82_gwaihir.png");
  }

  function handleMouseLeave(event: any) {
    setHoverImage("https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/cards/card.jpg");
  }

  function openTab(tabName: string) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].setAttribute("display","none");
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    var tabElement = document.getElementById(tabName);
    if (tabElement) {
      tabElement.setAttribute("display","block");
      setViewTab(tabElement.id)
    }
    // event.currentTarget.className += " active";
  }

  const cards = groupTable.cards;
  return (
      <div
        className="droptarget flex-1"
        onDrop={drop} 
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
        
        {/* Hands */}
        <Draggable handle="strong">
        <div 
          className="bg-gray-700"
          style={{position:"absolute",width:"1000px",height:"180px",top:"75%",left:"1%",display:"flex",flexDirection:"column"}}
        >
            <div className="tab bg-gray-900">
              <strong className="p-4"><FontAwesomeIcon className="text-white" icon={faGripLines}/></strong>
              <button 
                className={cx({
                  "tablinks": true,
                  "active": viewTab === "tabShared"
                })} 
                onClick={() => openTab('tabShared')}>Shared
              </button>
              <button 
                className={cx({
                  "tablinks": true,
                  "active": viewTab === "tabPlayer1"
                })} 
                onClick={() => openTab('tabPlayer1')}>Player 1
              </button>
              <button 
                className={cx({
                  "tablinks": true,
                  "active": viewTab === "tabPlayer2"
                })} 
                onClick={() => openTab('tabPlayer2')}>Player 2
              </button>
            </div>

            <div 
              id="tabShared" 
              className="tabcontent"
              style={{display: viewTab === "tabShared" ? "block" : "none"}}
            >
              <h3>London</h3>
              <p>London is the capital city of England.</p>
            </div>

            <div 
              id="tabPlayer1" 
              className="tabcontent"
              style={{display: viewTab === "tabPlayer1" ? "block" : "none"}}
            >
              <h3>Paris</h3>
              <p>Paris is the capital of France.</p> 
            </div>

            <div 
              id="tabPlayer2" 
              className="tabcontent"
              style={{display: viewTab === "tabPlayer2" ? "block" : "none"}}
            >
              <h3>Tokyo</h3>
              <p>Tokyo is the capital of Japan.</p>
            </div>
        </div>
        </Draggable>

        <img
          className={cx({
            "dropitem h-32 object-cover -ml-16 z-30": true,
            "hand-card-animate": !dragging
            //"hand-card-selected": dragging
          })}
          style={{height:"120px",transform: dragging? "scale(1.0, 1.0) rotateX(0deg) translate3d("+deltaXY.dx+"px, "+deltaXY.dy+"px, 0px)": ""}}
          onDragStart={dragStart} 
          onDragEnd={dragEnd}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          draggable="true" 
          id="card1"
          src="https://images-cdn.fantasyflightgames.com/filer_public/83/8b/838b34bc-9188-4311-b04a-33dab2a527e0/mec82_gwaihir.png">
        </img>


        

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
