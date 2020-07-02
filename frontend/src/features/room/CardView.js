import React, { useState, useEffect, useRef } from "react";
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


export const CardView = ({
    inputCard,
    cardIndex,
    stackIndex,
    group,
    broadcast,
  }) => {
    const gameUIView = React.useContext(GameUIViewContext);
    const [card, setCard] = useState(inputCard);
    const [shiftDown, setShiftDown] = useState(false);
//    const activeCard = useActiveCard();
    const setActiveCard = useSetActiveCard();
    const [isActive, setIsActive] = useState(false);
    const groups = gameUIView.game_ui.game.groups;
    const cardWatch = gameUIView.game_ui.game.groups[group.id].stacks[stackIndex]?.cards[cardIndex]

    // console.log('printing out card path');
    // console.log(group.id);
    // console.log(gameUIView.game_ui.game.groups[group.id]);
    // console.log(stackIndex);
    // console.log(gameUIView.game_ui.game.groups[group.id].stacks[stackIndex]);
    // console.log(cardIndex);
    // console.log(gameUIView.game_ui.game.groups[group.id].stacks[stackIndex].cards[cardIndex]);
  
    useEffect(() => {    
      if (cardWatch) setCard(cardWatch);
    }, [cardWatch]);

    const handleSetActiveCard = (event) => {
        if (!isActive) {
            setIsActive(true);
            setActiveCard(card);
        }
    }

    const handleUnsetActiveCard = (event) => {
        if (isActive) {
            setIsActive(false);
            setActiveCard(null);
        }
    }

    const onClick = (event) => {
        console.log('click');
        return;
    }

    const onDoubleClick = (event) => {
        if (shiftDown) return;
        if (!card.exhausted) {
            card.exhausted = true;
            card.rotation = 90;
        } else {
            card.exhausted = false;
            card.rotation = 0;
        }
        setCard({...card});
        const newGroups = groups;
        newGroups[group.id].stacks[stackIndex].cards[cardIndex] = card;
        broadcast("update_groups",{groups: {...newGroups}});
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

    console.log('rendering card');
    //console.log(card.id);
    if (!card) return null;
    return (
        <div 
            key={card.id}
            style={{
                position: "absolute",
                background: `url(${card.src}) no-repeat`,
                backgroundSize: "contain",
                height: `${CARDSCALE/0.72}vw`,
                width: `${CARDSCALE}vw`,
                left: `${CARDSCALE/3*cardIndex}vw`,
                borderWidth: '2px',
                borderRadius: '5px',
                borderColor: isActive ? 'yellow' : 'transparent',
                //transform: `rotate(${angles}deg)`,
                transform: `rotate(${card.rotation}deg)`,
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
            onMouseOver={event => handleSetActiveCard(event)}
            onMouseLeave={event => handleUnsetActiveCard(event)}
        >
            <Tokens card={card} adjustVisible={shiftDown && isActive}></Tokens>
        </div>
    )
  }
  
  export default CardView;