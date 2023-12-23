import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAlertMessage } from "../store/playerUiSlice";
const promptStyle = {
  MozBoxShadow: '0 0 50px 20px black',
  WebkitBoxShadow: '0 0 50px 20px black',
  boxShadow: '0 0 50px 20px black',
}

export const Alert = React.memo(({
}) => {
  const dispatch = useDispatch();
  const alertMessage = useSelector(state => state?.playerUi?.alertMessage);
  const alertTime = alertMessage?.timestamp;
  const alertText = alertMessage?.text;

  // use effect to clear alert after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setAlertMessage(null));
    }, 3000);
    return () => clearTimeout(timer);
  }, [alertMessage]);

  // If alert occued more than 3 seconds ago, don't show it
  if (alertMessage === null || alertTime < Date.now() - 3000) return null;

  return (
    <div className="absolute text-white" 
      style={{
        left: "50%", 
        top: "2%", 
        width: "19%",
        zIndex: 3e3,
        transform: "translate(-50%, 0%)",
        textAlign: "center",
      }}>
      <div className="m-3 p-1 bg-red-700 rounded" style={promptStyle}>
        <div className="">{alertText}</div>
      </div>   
    </div>
  )
})