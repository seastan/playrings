export const flipCard = [
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
                        "_MESSAGES": [["{playerN} flipped ", ["_ACTIVE_FACE", "name"], " faceup."]]
                    }
                ]
            }
        ]
    }
]