import { Checkbox } from "@material-ui/core";
import React, {useState} from "react";
import ReactModal from "react-modal";
import Button from "../../components/basic/Button";
import useProfile from "../../hooks/useProfile";
import { withStyles } from "@material-ui/core/styles";
import { TOOLTIPINFO } from "./Constants";


const CustomColorCheckbox = withStyles({
  root: {
    color: "#ffffff",
    "&$checked": {
      color: "#ffffff"
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />);


export const TooltipModal = React.memo(({
    tooltipId,
    tooltipIds,
    setTooltipIds,
    setShowModal,
    gameBroadcast,
}) => {
    const myUser = useProfile();
    const handleClick = () => {
      var index = tooltipIds.indexOf(tooltipId);
      if (index !== -1) {
        tooltipIds.splice(index, 1);
      }
      setTooltipIds([...tooltipIds])
    }
    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        contentLabel="Spawn a card"
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto overflow-auto p-5 bg-gray-700 border max-w-xs mx-auto my-12 rounded-lg outline-none max-h-3/4"
      >
        <div className="text-white mb-2">{TOOLTIPINFO[tooltipId]}</div>    
        <span>
          <Button onClick={handleClick} className="inline mt-2">
            Never show again
          </Button>
          <Button onClick={handleClick} className="inline mt-2" isPrimary>
            Close
          </Button>
        </span>
      </ReactModal>
    )
})