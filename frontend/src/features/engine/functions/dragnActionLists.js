
export const dragnActionLists = {
    setRotation: (deg) => (
      [
        ["GAME_SET_VAL", "/$ACTIVE_CARD_PATH/rotation", deg],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " set rotation of ", "$ACTIVE_FACE.name", " to ", deg, "."]
      ]
    ),
    toggleTrigger: (stepId) => (
      [
        ["DEFINE", "$STEP_ID", stepId],
        ["COND",
          "$ACTIVE_FACE.triggers.$STEP_ID",
          [
            ["GAME_SET_VAL", "/$ACTIVE_FACE_PATH/triggers/" + stepId, false],
            ["GAME_ADD_MESSAGE", "$PLAYER_N", " removed ", stepId, " trigger to ", "$ACTIVE_FACE.name", "."]
          ],
          true,
          [
            ["GAME_SET_VAL", "/$ACTIVE_FACE_PATH/triggers/" + stepId, true],
            ["GAME_ADD_MESSAGE", "$PLAYER_N", " added ", stepId, " trigger to ", "$ACTIVE_FACE.name", "."]
          ]
        ]
      ]
    ),
    targetCard: (cardId) => ([
      ["GAME_SET_VAL", "/cardById/" + cardId + "/targeting/$PLAYER_N", true],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " targeted ", ["FACEUP_NAME_FROM_CARD_ID", cardId], "."]
    ]),
    setStep: (stepInfo, stepIndex) => ([
      ["GAME_SET_VAL", "/stepIndex", stepIndex],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " set the round step to ", stepInfo.text, "."]
    ]),
    moveCardToTop: (cardId, destGroupId, label) => ([
      ["MOVE_CARD", cardId, destGroupId, 0],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " to top of ", label, "."]
    ]),
    moveCardToShuffled: (cardId, destGroupId, label) => ([
      ["MOVE_CARD", cardId, destGroupId, 0],
      ["SHUFFLE_GROUP", destGroupId],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into ", label, "."]
    ]),
    moveCardToBottom: (cardId, destGroupId, label) => ([
      ["MOVE_CARD", cardId, destGroupId, -1],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " to bottom of ", label, "."]
    ]),
    moveCardToTopX: (cardId, destGroupId, label) => ([
      ["INPUT", "integer", "$VAL", "Shuffle into top:", 5],
      ["MOVE_CARD", cardId, destGroupId, 0],
      ["SHUFFLE_TOP_X", destGroupId, "$VAL"],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into the top ", "$VAL", " cards of ", label, "."]
    ]),
    moveCardToBottomX: (cardId, destGroupId, label) => ([
      ["INPUT", "integer", "$VAL", "Shuffle into bottom:", 5],
      ["MOVE_CARD", cardId, destGroupId, -1],
      ["SHUFFLE_BOTTOM_X", destGroupId, "$VAL"],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into the bottom ", "$VAL", " cards of ", label, "."]
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
          ["GAME_SET_VAL", "/cardById/" + card.id + "/currentSide", "B"]
        ],
        true,
        [
          ["GAME_SET_VAL", "/cardById/" + card.id + "/currentSide", "A"],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " flipped ", ["FACEUP_NAME_FROM_CARD_ID", card.id], " faceup."]
        ]
      ]
    ]),
    deleteCard: (card) => ([
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " deleted ", ["FACEUP_NAME_FROM_CARD_ID", card.id], "."],
      ["DELETE_CARD", card.id]
    ])
}
  