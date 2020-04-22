import React, { useState, useEffect } from "react";
import CountdownTimer from "../../components/CountdownTimer";
import usePrevious from "../../hooks/usePrevious";

interface Props {
  when_seats_full: null | string;
}

export const RoomStagingTimer: React.FC<Props> = ({ when_seats_full }) => {
  const [showTimer, setShowTimer] = useState(false);
  const previous_when_seats_full = usePrevious(when_seats_full);
  useEffect(() => {
    if (previous_when_seats_full == null && when_seats_full != null) {
      setShowTimer(true);
    }
    if (previous_when_seats_full != null && when_seats_full == null) {
      setShowTimer(false);
    }
  }, [previous_when_seats_full, when_seats_full]);
  if (!showTimer) {
    return null;
  }
  return (
    <div className="bg-green-700 text-gray-100 p-4 mx-auto rounded max-w-sm mt-4 mb-4">
      <div className="text-center">
        <h1 className="font-semibold">Table full!</h1>
        <div className="text-2xl mt-2">
          Game starting in...
          <CountdownTimer initialSeconds={1} />
        </div>
      </div>
    </div>
  );
};
export default RoomStagingTimer;
