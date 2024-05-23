import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../store/playerUiSlice";
import { useFormatLabelsInText } from "../messages/MessageLine";

const promptStyle = {
  MozBoxShadow: '0 0 50px 20px black',
  WebkitBoxShadow: '0 0 50px 20px black',
  boxShadow: '0 0 50px 20px black',
}

export const Alert = React.memo(({
}) => {
  const dispatch = useDispatch();
  const formatLabelsInText = useFormatLabelsInText();
  const alert = useSelector(state => state?.playerUi?.alert);
  var alertText = alert?.text;
  alertText = formatLabelsInText(alertText);
  const alertLevel = alert?.level;

  const [progress, setProgress] = useState(0);

  // use effect to clear alert after 8 seconds and update progress bar
  useEffect(() => {

    if (alert && alertLevel !== "crash") {
      const numWords = alertText.split(' ').length;
      const timeToRead = Math.max(1000, numWords * 300);

      const startTime = Date.now();
      setProgress(0);

      const timer = setTimeout(() => {
        dispatch(setAlert(null));
      }, timeToRead + 100);

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        console.log('progress interval', elapsed, progress);
        setProgress((elapsed / timeToRead) * 100);
      }, 100);

      return () => {
        setProgress(0);
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [alert]);

  if (alert === null) return null;

  var alertColor = "bg-red-700";
  if (alertLevel === "crash") alertColor = "bg-red-700";
  if (alertLevel === "error") alertColor = "bg-red-700";
  if (alertLevel === "info") alertColor = "bg-blue-700";
  if (alertLevel === "success") alertColor = "bg-green-700";
  if (alertLevel === "warning") alertColor = "bg-yellow-700";

  return (
    <div className="absolute text-white" 
      style={{
        left: "70%", 
        top: "2%", 
        width: "25%",
        zIndex: 3e6,
        textAlign: "center",
        opacity: 0.9,
      }}>
      <div className={`m-3 p-1 ${alertColor} rounded`} style={promptStyle}>
        <div className="">{alertText}</div>
        <div style={{ position: 'relative', height: '4px', marginTop: '4px' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            transition: 'width 0.1s linear',
          }}></div>
        </div>
      </div>   
    </div>
  )
});
