import React from "react";

export const Announcements = ({selectedPlugin}) => {
    console.log("Announcements", selectedPlugin, selectedPlugin?.announcements)
    return(
        <div className="text-white rounded-lg bg-gray-600-30 flex justify-center w-full my-2" style={{maxWidth: "600px"}}>
            <div className="w-full h-32 max-h-32 overflow-y-scroll text-lg" style={{textIndent: "-20px", paddingLeft: "30px"}}>
                {selectedPlugin?.announcements?.map((announcement) => (
                    <div>{announcement}</div>
                ))}
            </div>
        </div>
    )
}
