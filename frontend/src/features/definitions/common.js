
export const keyClass = "m-auto border cursor-pointer bg-gray-500 hover:bg-gray-400 text-center bottom inline-block";
export const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}

export const defaultdict = (defaultObj, defaultVal) => {
  return new Proxy(defaultObj, {
    get: (target, name) => name in target ? target[name] : defaultVal
  });
}

export const getCurrentFace = (card) => {
  if (!card?.currentSide) return null;
  return card.sides[card.currentSide];
}

export const getVisibleSide = (card, playerN) => {
  if (!card) return null;
  const currentSide = card.currentSide;
  if (currentSide === "A" || card.peeking[playerN]) return "A";
  else return "B";
}
  
export const getVisibleFace = (card, playerN) => {
  const visibleSide = getVisibleSide(card, playerN);
  if (visibleSide) return card.sides[visibleSide];
  else return null;
}
  
export const getVisibleFaceSrc = (visibleFace, user, gameDef) => {
  if (!visibleFace) return {src: null, default: "image not found"};
  var src = visibleFace.imageUrl;
  // If there's no src listed, it's probably a card back
  if (!src || src ==="") {    
    src = gameDef?.cardBacks?.[visibleFace.name]?.imageUrl;
  }
  // If there's still no src listed, there's a problem with the card or game definition #FIXME: visual idicator of missing image
  if (!src || src ==="") src = ""
  const language = user?.language || "English";
  const srcLanguage = src.replace('/English/','/'+language+'/');
  
  return {
    src: srcLanguage,
    default: src
  }
}

// Returns the left offset of the first card in a group
export const getFirstCardOffset = (width, cardSize) => {
  return 0.2 + (1.39-width)*cardSize/2;
}

export const dragnActionLists = {
  setRotation: (deg) => (
    [
      ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", deg],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " set rotation of ", "$ACTIVE_FACE.name", " to ", deg, "."]
    ]
  ),
  toggleTrigger: (stepId) => (
    [
      ["DEFINE", "$STEP_ID", stepId],
      ["COND",
        "$ACTIVE_FACE.triggers.$STEP_ID",
        [
          ["GAME_SET_VAL", "$ACTIVE_FACE_PATH", "triggers", stepId, false],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " removed ", stepId, " trigger to ", "$ACTIVE_FACE.name", "."]
        ],
        true,
        [
          ["GAME_SET_VAL", "$ACTIVE_FACE_PATH", "triggers", stepId, true],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " added ", stepId, " trigger to ", "$ACTIVE_FACE.name", "."]
        ]
      ]
    ]
  ),
  clearTargets: () => ([
    ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID",
      ["GAME_SET_VAL", "cardById", "$CARD_ID", "targeting", "$PLAYER_N", false]
    ],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " cleared their targets."]
  ]),
  targetCard: (cardId) => ([
    ["GAME_SET_VAL", "cardById", cardId, "targeting", "$PLAYER_N", true],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " targeted ", ["FACEUP_NAME_FROM_CARD_ID", cardId], "."]
  ]),
  setStep: (stepInfo, stepIndex) => ([
    ["GAME_SET_VAL", "stepIndex", stepIndex],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " set the round step to ", stepInfo.text, "."]
  ]),
  moveCardToTop: (cardId, destGroupId) => ([
    ["MOVE_CARD", cardId, destGroupId, 0, 0],
    ["SHUFFLE_GROUP", destGroupId],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " to top of ", "$GAME.groupById."+destGroupId+".name", "."]
  ]),
  moveCardToBottom: (cardId, destGroupId) => ([
    ["MOVE_CARD", cardId, destGroupId, -1, 0],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " to bottom of ", "$GAME.groupById."+destGroupId+".name", "."]
  ]),
  moveCardToTopX: (cardId, destGroupId) => ([
    ["INPUT", "integer", "$VAL", "Shuffle into top:", 5],
    ["MOVE_CARD", cardId, destGroupId, 0, 0],
    ["SHUFFLE_TOP_X", destGroupId, "$VAL"],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into the top ", "$VAL", " cards of ", "$GAME.groupById."+destGroupId+".name", "."]
  ]),
  moveCardToBottomX: (cardId, destGroupId) => ([
    ["INPUT", "integer", "$VAL", "Shuffle into bottom:", 5],
    ["MOVE_CARD", cardId, destGroupId, -1, 0],
    ["SHUFFLE_BOTTOM_X", destGroupId, "$VAL"],
    ["GAME_ADD_MESSAGE", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into the bottom ", "$VAL", " cards of ", "$GAME.groupById."+destGroupId+".name", "."]
  ]),
  detach: (card) => ([
    ["COND",
      ["GREATER_THAN", card.cardIndex, 0],
      [
        ["MOVE_CARD", card.id, card.groupId, card.stackIndex + 1, 0],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " detached ", ["FACEUP_NAME_FROM_CARD_ID", card.id], "."]
      ]
    ]
  ]),
  flipCard: (card) => ([
    ["COND",
      ["EQUAL", card.currentSide, "A"],
      [
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " flipped ", ["FACEUP_NAME_FROM_CARD_ID", card.id], " facedown."],
        ["GAME_SET_VAL", "cardById", card.id, "currentSide", "B"]
      ],
      true,
      [
        ["GAME_SET_VAL", "cardById", card.id, "currentSide", "A"],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " flipped ", ["FACEUP_NAME_FROM_CARD_ID", card.id], " faceup."]
      ]
    ]
  ])
}
