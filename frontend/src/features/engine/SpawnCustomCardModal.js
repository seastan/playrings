import React, {useContext, useState} from "react";
import ReactModal from "react-modal";
import { useForm } from "react-hook-form";
import Button from "../../components/basic/Button";
import Select from 'react-select'
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useDispatch } from "react-redux";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./functions/useGameDefinition";
import { usePlugin } from "./functions/usePlugin";

export const SpawnCustomCardModal = React.memo(({}) => {
  const dispatch = useDispatch();
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const gameDef = useGameDefinition();    
  const cardDb = usePlugin()?.card_db;

  const { register, handleSubmit } = useForm();
  const backOptions = [];
  for (var back of Object.keys(gameDef.cardBacks)) backOptions.push({ value: back, label: back })
  backOptions.push({ value: "custom", label: "custom" })
  
  const [backType, setBackType] = useState(backOptions[0]);

  if (!cardDb) return;
  const card0 = cardDb[Object.keys(cardDb)[0]];
  const face0 = card0.A;
  const faceProperties = ["imageUrl"];
  for (var prop of Object.keys(face0)) {
    if (["uuid", "cardBack", "imageUrl"].includes(prop)) continue;
    else faceProperties.push(prop);
  };

  console.log("spawncust", card0)

  const onSubmit = (inputs) => {
    const deckGroupId = inputs.loadGroupId;
    //const discardGroupId = gameDef?.groups?.[deckGroupId]?.discardGroupId;

    const [faceA, faceB] = [{}, {}];
    for (var prop of faceProperties) {
      faceA[prop] = inputs["sideA"+prop];
      faceB[prop] = inputs["sideA"+prop];
    }

    const loadList = [{
      "cardDetails": {
        "A": faceA,
        "B": faceB
      },
      "quantity": 1,
      "loadGroupId": deckGroupId
    }]

    gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
    chatBroadcast("game_update", {message: "spawned "+ loadList[0].cardRow.sides.A.printname + "."});
  }

    const lineInput = (id, title) => {
      return (
        <div className="mb-1">
          <input
            ref={register({ required: false })} name={id}
            className="form-control mb-1"
            style={{width:"80%"}}
            // style={{width:"80%"}}
            onFocus={event => dispatch(setTyping(true))}
            onBlur={event => dispatch(setTyping(false))} 
            placeholder={title}
          />
        </div>
      )
    }

    const sideForm = (sideX) => {
      return(<>
        <select className="form-control mb-1 text-gray-400" ref={register({ required: false })} name={sideX+"type"}>
          <option value="_Other" selected disabled hidden>Type...</option>
          {Object.keys(gameDef?.cardTypes).map((typeName,_typeIndex) => (
            <option value={typeName}>{typeName}</option>
          ))}
        </select>
        {faceProperties.map((faceProperty,_propertyIndex) => {
          if (faceProperty !== "type") return(lineInput(sideX+faceProperty, faceProperty));
        })}
      </>)
    }

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => dispatch(setShowModal(null))}
        contentLabel="Spawn a custom card"
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto overflow-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
        style={{
          content: {
            width: "50vw",
            maxHeight: "85vh",
            overflowY: "scroll",
          }
        }}>
        {/* <h1 className="mb-2">Spawn a custom card</h1> */}

        <form className="w-full" onSubmit={handleSubmit(onSubmit)}> 
          <label for="owner"><h2 className="text-white">Load group: </h2></label>
          <select className="form-control mb-1" style={{width:"35%"}} ref={register({ required: false })} id={"loadGroupId"} name={"loadGroupId"}>
            {Object.keys(gameDef?.groups).sort().map((groupId,_groupIndex) => (
              <option value={groupId}>{gameDef?.groups?.[groupId]?.name}</option>
            ))}
          </select>
          <div className="w-full h-full">
            <table className="w-full h-full">
              <tbody>
                <td className="align-top" style={{width:"50%"}}>
                  <h2 className="text-white" style={{height:"40px"}}>Side A</h2>
                  {sideForm("sideA")}
                </td>
                <td className="align-top" style={{width:"50%"}}>
                  <div className="w-full">
                    <div className="float-left" style={{width:"50%"}}>
                      <h2 className="text-white" style={{height:"40px"}}>Side B</h2>
                    </div>
                    <div>
                      <Select         
                        value={backType}
                        onChange={(selectedOption) => setBackType(selectedOption)}
                        options={backOptions} />
                    </div>
                  </div>
                  {backType.value === "custom" && sideForm("sideB")}
                </td>
              </tbody>
            </table>
{/* 
            <div className="h-full float-left" style={{width:"50%"}}>
            </div>
            <div className="h-full float-left" style={{width:"50%"}}>
              <div className="w-full">
              </div>
              {backType.value === "custom" && sideForm("sideB")}
            </div> */}
          </div>

          <div className="relative w-full" style={{height:"40px"}}>
            <div className="relative" style={{width:"300px", left:"50%", transform: 'translate(-50%, 0%)'}}>
              <Button isSubmit isPrimary>
                Spawn
              </Button>
            </div>
          </div>
        </form>

      </ReactModal>
    )
})