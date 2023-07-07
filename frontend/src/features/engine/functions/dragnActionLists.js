
export const dragnActionLists = {
    setRotation: (deg) => (
      [
        ["SET", "/$ACTIVE_CARD_PATH/rotation", deg],
        ["LOG", "$PLAYER_N", " set rotation of ", "$ACTIVE_FACE.name", " to ", deg, "."]
      ]
    ),
    toggleTrigger: (stepId) => (
      [
        ["DEFINE", "$STEP_ID", stepId],
        ["COND",
          "$ACTIVE_FACE.triggers.$STEP_ID",
          [
            ["SET", "/$ACTIVE_FACE_PATH/triggers/" + stepId, false],
            ["LOG", "$PLAYER_N", " removed ", stepId, " trigger to ", "$ACTIVE_FACE.name", "."]
          ],
          true,
          [
            ["SET", "/$ACTIVE_FACE_PATH/triggers/" + stepId, true],
            ["LOG", "$PLAYER_N", " added ", stepId, " trigger to ", "$ACTIVE_FACE.name", "."]
          ]
        ]
      ]
    ),
    targetCard: (cardId) => ([
      ["SET", "/cardById/" + cardId + "/targeting/$PLAYER_N", true],
      ["LOG", "$PLAYER_N", " targeted ", ["FACEUP_NAME_FROM_CARD_ID", cardId], "."]
    ]),
    setStep: (stepInfo, stepIndex) => ([
      ["SET", "/stepIndex", stepIndex],
      ["LOG", "$PLAYER_N", " set the round step to ", stepInfo.text, "."]
    ]),
    moveCardToTop: (cardId, destGroupId, label) => ([
      ["MOVE_CARD", cardId, destGroupId, 0],
      ["LOG", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " to top of ", label, "."]
    ]),
    moveCardToShuffled: (cardId, destGroupId, label) => ([
      ["MOVE_CARD", cardId, destGroupId, 0],
      ["SHUFFLE_GROUP", destGroupId],
      ["LOG", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into ", label, "."]
    ]),
    moveCardToBottom: (cardId, destGroupId, label) => ([
      ["MOVE_CARD", cardId, destGroupId, -1],
      ["LOG", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " to bottom of ", label, "."]
    ]),
    moveCardToTopX: (cardId, destGroupId, label) => ([
      ["INPUT", "integer", "$VAL", "Shuffle into top:", 5],
      ["MOVE_CARD", cardId, destGroupId, 0],
      ["SHUFFLE_TOP_X", destGroupId, "$VAL"],
      ["LOG", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into the top ", "$VAL", " cards of ", label, "."]
    ]),
    moveCardToBottomX: (cardId, destGroupId, label) => ([
      ["INPUT", "integer", "$VAL", "Shuffle into bottom:", 5],
      ["MOVE_CARD", cardId, destGroupId, -1],
      ["SHUFFLE_BOTTOM_X", destGroupId, "$VAL"],
      ["LOG", "$PLAYER_N", " shuffled ", ["FACEUP_NAME_FROM_CARD_ID", cardId], " into the bottom ", "$VAL", " cards of ", label, "."]
    ]),
    detach: (card) => ([
      ["COND",
        ["GREATER_THAN", card.cardIndex, 0],
        [
          ["MOVE_CARD", card.id, card.groupId, card.stackIndex + 1, 0],
          ["LOG", "$PLAYER_N", " detached ", ["FACEUP_NAME_FROM_CARD_ID", card.id], "."]
        ]
      ]
    ]),
    flipCard: (card) => ([
      ["COND",
        ["EQUAL", card.currentSide, "A"],
        [
          ["LOG", "$PLAYER_N", " flipped ", ["FACEUP_NAME_FROM_CARD_ID", card.id], " facedown."],
          ["SET", "/cardById/" + card.id + "/currentSide", "B"]
        ],
        true,
        [
          ["SET", "/cardById/" + card.id + "/currentSide", "A"],
          ["LOG", "$PLAYER_N", " flipped ", ["FACEUP_NAME_FROM_CARD_ID", card.id], " faceup."]
        ]
      ]
    ]),
    deleteCard: (card) => ([
      ["LOG", "$PLAYER_N", " deleted ", ["FACEUP_NAME_FROM_CARD_ID", card.id], "."],
      ["DELETE_CARD", card.id]
    ]),
    chooseRandom: (groupId) => ([
      ["DEFINE", "$RANDOM_IDX", ["RANDOM_INT", 0, ["SUBTRACT", ["LENGTH", "$GAME.groupById." + groupId + ".stackIds"], 1]]],
      ["DEFINE", "$STACK_ID", "$GAME.groupById." + groupId + ".stackIds.[$RANDOM_IDX]"],
      ["DEFINE", "$CARD_ID", "$GAME.stackById.$STACK_ID.cardIds.[0]"],
      ["TARGET", "$CARD_ID"],
      ["LOG", "$PLAYER_N", " chose a random card from ", "$GAME.groupById." + groupId + ".label", "."]
    ])
}
  