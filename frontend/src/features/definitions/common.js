
export const keyClass = "m-auto border cursor-pointer bg-gray-500 hover:bg-gray-400 text-center bottom inline-block";
export const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}

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
    )
}
