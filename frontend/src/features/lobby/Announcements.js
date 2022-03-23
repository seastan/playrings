import React from "react";

export const Announcements = () => {
    return(
        <div className="border text-white flex justify-center w-full my-2" style={{maxWidth: "600px"}}>
            <div className="w-full h-32 max-h-32 overflow-y-scroll text-lg" style={{textIndent: "-20px", paddingLeft: "30px"}}>
                <div>{"2022-03-23 When a card is dragged over another card, it will now go behind it to indicate that it will become an attachment, instead of just becoming semi-transparent."}</div>
                <div>{"2022-03-22 Added Spanish localization to in-game UI. Select your language in your profile."}</div>
                <div>{"2022-03-20 Major update to the backend. Please report any strange behavior."}</div>
                <div>{"2022-03-20 Shift+A automation added to Master of the Forge and Imladris Stargazer."}</div>
                <div>{"2022-02-26 New basic tutorial."}</div>
                <div>{"2022-02-26 Added visual indicators for committed characters."}</div>
                <div>{"2022-02-19 HD card images now available for certain Patreon supporters."}</div>
            </div>
        </div>
    )
}