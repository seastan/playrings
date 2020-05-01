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
  const [deltaXY, setDeltaXY] = useState({x: 0, y: 0});
  const [hoverImage, setHoverImage] = useState("");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const gameUIView = useGameUIView();
  //if (!gameUIView) return(null);
  const winner = gameUIView != null ? gameUIView.game_ui.game.winner : null;
  const cardHeight = "h-24";
  const bidClasses = {
    "font-semibold text-lg text-blue-800": emphasizeBidding,
  };

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
    console.log(event.pageX,event.pageY);
    setOrigin({x:event.pageX,y:event.pageY});
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY) + ',' + event.target.id;
    console.log(str);
    event.dataTransfer.setData("Text", str);

    var img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    event.dataTransfer.setDragImage(img, 0, 0);

    // var dragIcon = document.createElement("span");
		// event.dataTransfer.setDragImage(dragIcon, -10, -10);	

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
			var x = event.pageX - origin.x;
      var y = event.pageY - origin.y;
      setDeltaXY({x,y});
			var css = "pointer-events: none; transform: scale(1.05, 1.05) rotateX(0deg) translate3d("+x+"px, "+y+"px, 0px);";
      var draggedCard = document.getElementById("test1");

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
    setDeltaXY({x:0,y:0})
    setTimeout(() => { console.log("timeout"); setDragging(false); }, 100);
    event.preventDefault();
    return false;
  }

  function handleMouseOver(event: any) {
    setHoverImage("https://images-cdn.fantasyflightgames.com/filer_public/83/8b/838b34bc-9188-4311-b04a-33dab2a527e0/mec82_gwaihir.png");
  }

  function handleMouseLeave(event: any) {
    setHoverImage("");
  }

  const cards = groupTable.cards;
  return (
      <div
        className="h-full droptarget"
        onDrop={drop} 
        onDragOver={handleDragOver}
        //style={{position: "absolute"}}
      >
        <img
          className={cx({
            "dropitem h-32 object-cover -ml-16 z-30": true,
            "hand-card-animate": !dragging
            //"hand-card-selected": dragging
          })}
          style={{transform: dragging? "scale(1.0, 1.0) rotateX(0deg) translate3d("+deltaXY.x+"px, "+deltaXY.y+"px, 0px)": ""}}
          onDragStart={dragStart} 
          onDragEnd={dragEnd}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          draggable="true" 
          id="card1"
          src="https://images-cdn.fantasyflightgames.com/filer_public/83/8b/838b34bc-9188-4311-b04a-33dab2a527e0/mec82_gwaihir.png">
        </img>

        <img
          style={{height:"200px"}}
          draggable="false" 
          id="display"
          src={hoverImage}>
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
