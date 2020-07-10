import React, { useState, useEffect, useRef, Component } from "react";
import { Tokens } from './Tokens';
import GameUIViewContext from "../../contexts/GameUIViewContext";
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";

//import cx from "classnames";

export const CARDSCALE = 4.5;

// PREVENT DOUBLECLICK REGISTERING 2 CLICK EVENTS
export const delay = n => new Promise(resolve => setTimeout(resolve, n));

export const cancellablePromise = promise => {
    let isCanceled = false;
  
    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
        error => reject({ isCanceled, error }),
      );
    });
  
    return {
      promise: wrappedPromise,
      cancel: () => (isCanceled = true),
    };
};

const useCancellablePromises = () => {
  const pendingPromises = useRef([]);

  const appendPendingPromise = promise =>
    pendingPromises.current = [...pendingPromises.current, promise];

  const removePendingPromise = promise =>
    pendingPromises.current = pendingPromises.current.filter(p => p !== promise);

  const clearPendingPromises = () => pendingPromises.current.map(p => p.cancel());

  const api = {
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
  };

  return api;
};

const useClickPreventionOnDoubleClick = (onClick, onDoubleClick) => {
    const api = useCancellablePromises();
  
    const handleClick = () => {
      api.clearPendingPromises();
      const waitForClick = cancellablePromise(delay(300));
      api.appendPendingPromise(waitForClick);
  
      return waitForClick.promise
        .then(() => {
          api.removePendingPromise(waitForClick);
          onClick();
        })
        .catch(errorInfo => {
          api.removePendingPromise(waitForClick);
          if (!errorInfo.isCanceled) {
            throw errorInfo.error;
          }
        });
    };
  
    const handleDoubleClick = () => {
      api.clearPendingPromises();
      onDoubleClick();
    };
  
    return [handleClick, handleDoubleClick];
};
// END PREVENT DOUBLECLICK REGISTERING 2 CLICK EVENTS





const CardComponent = ({
    inputCard,
    cardIndex,
    stackIndex,
    groupID,
    group,
    broadcast,
}) => {
    //const [card, setCard] = useState(inputCard);
    const [shiftDown, setShiftDown] = useState(false);
    const setActiveCard = useSetActiveCard();
    const [isActive, setIsActive] = useState(false);
    //const groups = gameUIView.game_ui.game.groups;
    //const cardWatch = groups[group.id].stacks[stackIndex]?.cards[cardIndex];

    //if (groupID==='gSharedStaging') console.log('rendering CardComponent');
    //if (groupID==='gSharedStaging') console.log(inputCard);

    // useEffect(() => {    
    //   if (inputCard) setCard(inputCard);
    // }, [inputCard]);
    console.log('renderingcardcomp', inputCard.id);

    const handleMouseOver = (event) => {
        if (!isActive) {
            setIsActive(true);
            setActiveCard(inputCard);
        }
    }

    const handleMouseLeave = (event) => {
        if (isActive) {
            setIsActive(false);
            setActiveCard(null);
        }
    }

    const onClick = (event) => {
        //console.log(gameUIView);
        broadcast("update_card",{card: inputCard, group_id: groupID, stack_index: stackIndex, card_index:cardIndex});
        
        return;
    }

    const onDoubleClick = (event) => {
        if (shiftDown) return;
        if (!inputCard.exhausted) {
            inputCard.exhausted = true;
            inputCard.rotation = 90;
        } else {
            inputCard.exhausted = false;
            inputCard.rotation = 0;
        }
        //setCard({...card});
        //const newGroup = group;
        //group.stacks[stackIndex].cards[cardIndex] = card;
        //setGroup({...group});
        //console.log(gameUIView.game_ui.game.groups);
        //console.log(group.id);
        //console.log(stackIndex);
        //console.log(groups[group.id].stacks[stackIndex]);
        //groups[group.id].stacks[stackIndex].cards[cardIndex] = card;
        broadcast("update_card",{card: inputCard, group_id: groupID, stack_index: stackIndex, card_index:cardIndex});
        //setTimeout(setActiveCard(card),2000);
    }

    const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(onClick, onDoubleClick);

    useEffect(() => {

        const onKeyDown = ({key}) => {
            if (key === "Shift") {
                setShiftDown(true);
            }
        }

        const onKeyUp = ({key}) => {
            if (key === "Shift") {
                setShiftDown(false);
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //console.log(card.id);
    //console.log('in');
    //console.log(group);
    if (!inputCard) return null;
    return (
        <div 
            key={inputCard.id}
            style={{
                position: "absolute",
                background: `url(${inputCard.src}) no-repeat`,
                backgroundSize: "contain",
                height: `${CARDSCALE/0.72}vw`,
                width: `${CARDSCALE}vw`,
                left: `${CARDSCALE/3*cardIndex}vw`,
                borderWidth: '2px',
                borderRadius: '5px',
                borderColor: isActive ? 'yellow' : 'transparent',
                //transform: `rotate(${angles}deg)`,
                transform: `rotate(${inputCard.rotation}deg)`,
                zIndex: 1e5-cardIndex,
                WebkitTransitionDuration: "0.1s",
                MozTransitionDuration: "0.1s",
                OTransitionDuration: "0.1s",
                transitionDuration: "0.1s",
                WebkitTransitionProperty: "-webkit-transform",
                MozTransitionProperty: "-moz-transform",
                OTransitionProperty: "-o-transform",
                transitionProperty: "transform",
                // WebkitBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                // MozBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                // boxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseOver={event => handleMouseOver(event)}
            onMouseLeave={event => handleMouseLeave(event)}
        >
            <div className='text-white'>{group.stacks[0]?.cards[0].exhausted ? 'ex' : 'notex'}</div>
            <div className='text-white'>{group.stacks[1]?.cards[0].exhausted ? 'ex' : 'notex'}</div>
            {/* <div>{cardIndex}</div> */}
            {/* <div className='text-white'>{gameUIView.game_ui.game.groups[group.id].stacks.length}</div> */}
            
            {/* <Tokens card={card} adjustVisible={shiftDown && isActive}></Tokens> */}
        </div>
    )
}
  



class CardClass extends Component {

    shouldComponentUpdate = (nextProps, nextState) => {
        //if (nextProps.group.updated === false) {
        if (nextProps.inputCard.exhausted && !this.props.inputCard.exhaused) {
            console.log('exhausting',this.props.stackIndex);
        }

        if ( 
            (JSON.stringify(nextProps.inputCard)!==JSON.stringify(this.props.inputCard)) //||
            //(nextProps.groupID!==this.props.groupID) ||
            //(nextProps.stackIndex!==this.props.stackIndex) ||
            //(nextProps.cardIndex!==this.props.cardIndex)
        ) {
            return true;
        } else {
            //console.log('DO UPDATE!!!!!');
            //console.log(this.props);
            //console.log(nextProps);
            return true; 
        }
    };
  
    render() {
        //if (this.props.groupID==='gSharedStaging') console.log('rendering Cardclass');
        //if (this.props.groupID==='gSharedStaging') console.log(this.props.inputCard);
        const inputCard = this.props.inputCard;
        const cardIndex = this.props.cardIndex;
        const stackIndex = this.props.stackIndex;
        const groupID = this.props.groupID;
        const broadcast = this.props.broadcast;
        //const gameUIView = this.props.gameUIView;
        return(
            <CardComponent
                inputCard={inputCard}
                cardIndex={cardIndex}
                stackIndex={stackIndex}
                groupID={groupID}
                group={this.props.group}
                broadcast={broadcast}
                //gameUIView={gameUIView}
            ></CardComponent>
        )
    }
}


const CardView = ({
    inputCard,
    cardIndex,
    stackIndex,
    groupID,
    broadcast,
    group,
  }) => {
    //if (groupID==='gSharedStaging') console.log('rendering Cardview');
    //const gameUIView = React.useContext(GameUIViewContext);
    console.log('rendering',inputCard.id);
    return (
        <CardClass
            inputCard={inputCard}
            cardIndex={cardIndex}
            stackIndex={stackIndex}
            groupID={groupID}
            group={group}
            broadcast={broadcast}
            //gameUIView={gameUIView}
        ></CardClass>
    )
};

export default CardView;



