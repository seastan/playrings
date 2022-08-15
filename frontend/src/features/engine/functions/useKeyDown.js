import { useContext } from 'react';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useDoActionList } from './useDoActionList';
import { useGameDefinition } from './useGameDefinition';

const defaultActionLists = {
    "increase_card_size": [
        {
            "_ACTION": "SET_VALUE",
            "_PATH": ["_GAME", "playerUi", "cardSizeFactor"],
            "_VALUE": ["*",["_GAME", "playerUi", "cardSizeFactor"],1.1],
        }
    ],
    "toggle_rotate": [
        ["COND",
            ["EQUAL", ["ACTIVE_CARD", "inPlay"], true],
            ["COND",
                ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0],
                [
                    ["SET", "$ACTIVE_CARD", "rotation", 90], 
                    ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
                ],
                ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 90],
                [
                    ["SET", "$ACTIVE_CARD", "rotation", 0], 
                    ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
                ],
            ]
        ]
    ],
/*     "toggle_rotate": [
        {
            "_ACTION": "CASES",
            "_CASES": [
                {
                    "_IF": [["_ACTIVE_CARD", "inPlay"], "==", true],
                    "_THEN": [
                        {
                        "_ACTION": "CASES",
                        "_CASES": [
                            {
                            "_IF": [["_ACTIVE_CARD", "rotation"], "==", 0],
                            "_THEN": [
                                {
                                "_ACTION": "SET_VALUE",
                                "_PATH": ["_ACTIVE_CARD", "rotation"],
                                "_VALUE": 90,
                                "_MESSAGES": [["{playerN} rotated ", ["_ACTIVE_FACE", "name"], " 90 degrees."]]
                                }
                            ]
                            },
                            {
                            "_IF": [["_ACTIVE_CARD", "rotation"], "==", 90],
                            "_THEN": [
                                {
                                "_ACTION": "SET_VALUE",
                                "_PATH": ["_ACTIVE_CARD", "rotation"],
                                "_VALUE": 0,
                                "_MESSAGES": [["{playerN} rotated ", ["_ACTIVE_FACE", "name"], " -90 degrees."]]
                                }
                            ]
                            }
                        ]
                        }
                    ]
                }
            ]
        }
    ], */
    "flip": [
        {
            "_ACTION": "CASES",
            "_CASES": [
                {
                    "_IF": [["_ACTIVE_CARD", "currentSide"], "==", "A"],
                    "_THEN": [
                        {
                            "_ACTION": "SET_VALUE",
                            "_PATH": ["_ACTIVE_CARD", "currentSide"],
                            "_VALUE": "B",
                            "_MESSAGES": [["{playerN} flipped ", ["_ACTIVE_FACE", "name"], " facedown."]]
                        }
                    ]
                },
                {
                    "_IF": [["_ACTIVE_CARD", "currentSide"], "==", "B"],
                    "_THEN": [
                        {
                            "_ACTION": "SET_VALUE",
                            "_PATH": ["_ACTIVE_CARD", "currentSide"],
                            "_VALUE": "A",
                            "_MESSAGES": [["{playerN} flipped ", ["_ACTIVE_CARD", "sides", "A", "name"], " faceup."]]
                        }
                    ]
                }
            ]
        }
    ]
}

const defaultHotkeys = {
    "ui": {
        "+": "increase_card_size",
        "-": "decrease_card_size",
    },
    "game": {
        "D": "draw",
        "ArrowLeft": "undo",
        "ArrowRight": "redo",
        "ArrowDown": "next_step",
        "ArrowUp": "prev_step",
        "Escape": "clear_targets",
        "Ctrl+Shift+R": "refresh_all",
        "Ctrl+Z": "undo",
        "Ctrl+Y": "redo",
    },
    "card": {
        "0": "zero_tokens",
        "A": "toggle_rotate",
        "F": "flip",
        "H": "shuffle_into_deck",
        "W": "draw_arrow",
        "T": "target",
        "X": "discard",
        "C": "detach",
        "B": "move_to_back",
        "Shift+A": "card_ability",
    }
}

export const useKeyDown = () => {
    const gameDef = useGameDefinition();
    const doActionList = useDoActionList();
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);

    return (event) => {
        const k = event.key;
        const unix_sec = Math.floor(Date.now() / 1000);
        var dictKey = k.toUpperCase();
        //if ((unix_sec - keypressShift) < 30) dictKey = "Shift+"+dictKey;
        //if ((unix_sec - keypressControl) < 30) dictKey = "Ctrl+"+dictKey;
        //if ((unix_sec - keypressAlt) < 30) dictKey = "Alt+"+dictKey;

        console.log("keypress",k)
        console.log("keypress",dictKey)
        console.log("keypress",gameDef.hotkeys[dictKey])
        console.log("keypress",k)

        if (Object.keys(gameDef.hotkeys).includes(dictKey)) doActionList(gameDef.hotkeys[dictKey]);
        //if (Object.keys(defaultHotkeys["card"]).includes(dictKey)) doActionList("_custom",defaultActionLists[defaultHotkeys["card"][dictKey]]);
        //else if (Object.keys(defaultHotkeys["ui"]).includes(dictKey)) doActionList("_custom",defaultActionLists[defaultHotkeys["ui"][dictKey]]);
        //else if (Object.keys(defaultHotkeys["game"]).includes(dictKey)) doActionList("_custom",defaultActionLists[defaultHotkeys["game"][dictKey]]);
        //else if (Object.keys(defaultHotkeys["token"]).includes(dictKey)) keyTokenAction(defaultHotkeys["token"][dictKey]);
    }

/*     return (actionListName, actionList = null, _options = null) => {
        const state = store.getState();
        if (Object.keys(gameDef.actionLists).includes(actionListName)) {
            actionList = gameDef.actionLists[actionListName]
        } else if (actionListName === "flipCard") {
            actionList = flipCard;
        }
        if (actionList != null) gameBroadcast("game_action", {
            action: "game_action_list", 
            options: {
                action_list: actionList, 
                player_ui: state.playerUi,
            }
        })
    } */
}