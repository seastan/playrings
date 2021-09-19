import React, {useState} from "react";
import ReactModal from "react-modal";
import { useForm } from "react-hook-form";
import { cardDB } from "../../cardDB/cardDB";
import Button from "../../components/basic/Button";
import Select from 'react-select'

export const SpawnCustomModal = React.memo(({
    setTyping,
    setShowModal,
    gameBroadcast,
    chatBroadcast,
}) => {
  const { register, handleSubmit } = useForm();
  const backOptions = [
    { value: 'encounter', label: 'Encounter' },
    { value: 'player', label: 'Player' },
    { value: 'custom', label: 'Custom' },
  ]
  
  const [backType, setBackType] = useState(backOptions[0]);

  const onSubmit = (inputs) => {
    const deckGroupId = inputs.owner;
    const discardGroupId = deckGroupId.replace("Deck","Discard");

    const loadList = [{
      "cardRow": {
        "cardencounterset": "",
        "sides": {
          "A": {
            "printname": inputs.sideAname,
            "sphere": inputs.sideAsphere,
            "text": inputs.sideAtext,
            "willpower": inputs.sideAwillpower,
            "hitpoints": inputs.sideAhitpoints,
            "shadow": inputs.sideAshadow,
            "engagementcost": inputs.sideAengagementcost,
            "traits": inputs.sideAtraits,
            "keywords": inputs.sideAkeywords,
            "type": inputs.sideAtype,
            "victorypoints": inputs.sideAvictorypoints,
            "cost": inputs.sideAcost,
            "name": inputs.sideAname,
            "questpoints": inputs.sideAquestpoints,
            "attack": inputs.sideAattack,
            "unique": inputs.sideAunique,
            "defense": inputs.sideAdefense,
            "threat": inputs.sideAthreat,
            "customimgurl": inputs.sideAcustomimgurl,
          },
          "B": {
            "printname": (backType.value === "encounter" || backType.value === "player" ? backType.value : inputs.sideBname),
            "sphere": inputs.sideBsphere,
            "text": inputs.sideBtext,
            "willpower": inputs.sideBwillpower,
            "hitpoints": inputs.sideBhitpoints,
            "shadow": inputs.sideBshadow,
            "engagementcost": inputs.sideBengagementcost,
            "traits": inputs.sideBtraits,
            "keywords": inputs.sideBkeywords,
            "type": inputs.sideBtype,
            "victorypoints": inputs.sideBvictorypoints,
            "cost": inputs.sideBcost,
            "name": (backType.value === "encounter" || backType.value === "player" ? backType.value : inputs.sideBname),
            "questpoints": inputs.sideBquestpoints,
            "attack": inputs.sideBattack,
            "unique": inputs.sideBunique,
            "defense": inputs.sideBdefense,
            "threat": inputs.sideBthreat,
            "customimgurl": inputs.sideBcustomimgurl,
          }
        },
        "cardquantity": "1",
        "cardsetid": "",
        "cardpackname": "",
        "cardid": "",
        "cardnumber": "1",
        "deckgroupid": deckGroupId,
        "discardgroupid": discardGroupId,
      },
      "quantity": 1,
      "groupId": "sharedStaging",
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
            onFocus={event => setTyping(true)}
            onBlur={event => setTyping(false)} 
            placeholder={title}
          />
        </div>
      )
    }

    const sideForm = (sideX) => {
      return(<>
        {lineInput(sideX+"name", "Name")}
        <select className="form-control mb-1 text-gray-400" ref={register({ required: false })} name={sideX+"type"}>
          <option value="Treachery" selected disabled hidden>Type...</option>
          <option value="Ally">Ally</option>
          <option value="Attachment">Attachment</option>
          <option value="Campaign">Campaign</option>
          <option value="Contract">Contract</option>
          <option value="Enemy">Enemy</option>
          <option value="Event">Event</option>
          <option value="Hero">Hero</option>
          <option value="Location">Location</option>
          <option value="Nightmare">Nightmare</option>
          <option value="Objective">Objective</option>
          <option value="Objective Ally">Objective Ally</option>
          <option value="Presentation">Presentation</option>
          <option value="Quest">Quest</option>
          <option value="Rules">Rules</option>
          <option value="Ship-Enemy">Ship-Enemy</option>
          <option value="Side Quest">Side Quest</option>
          <option value="Treachery">Treachery</option>
          <option value="Treasure">Treasure</option>
        </select>
        <select className="form-control mb-1 text-gray-400" ref={register({ required: false })} name={sideX+"sphere"}>
          <option value="" selected disabled hidden>Sphere...</option>
          <option value="">None</option>
          <option value="Leadership">Leadership</option>
          <option value="Lore">Lore</option>
          <option value="Spirit">Spirit</option>
          <option value="Tactics">Tactics</option>
          <option value="Neutral">Neutral</option>
          <option value="Baggins">Baggins</option>
          <option value="Fellowship">Fellowship</option>
        </select>
        <select className="form-control mb-1 text-gray-400" ref={register({ required: false })} name={sideX+"unique"}>
          <option value="0" selected disabled hidden>Unique...</option>
          <option value="0">False</option>
          <option value="1">True</option>
        </select>
        {lineInput(sideX+"cost", "Cost / Quest Stage")}
        {lineInput(sideX+"engagementcost", "Engagement Cost / Quest Letter")}
        {lineInput(sideX+"threat", "Threat")}
        {lineInput(sideX+"willpower", "Willpower")}
        {lineInput(sideX+"attack", "Attack")}
        {lineInput(sideX+"defense", "Defense")}
        {lineInput(sideX+"hitpoints", "Hit Points")}
        {lineInput(sideX+"questpoints", "Quest Points")}
        {lineInput(sideX+"victorypoints", "Victory Points")}
        {lineInput(sideX+"traits", "Traits")}
        {lineInput(sideX+"keywords", "Keywords")}
        {lineInput(sideX+"text", "Text")}
        {lineInput(sideX+"shadow", "Shadow")}
        {lineInput(sideX+"customimgurl", "Image URL")}
      </>)
    }

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => setShowModal(null)}
        contentLabel="Spawn a custom card"
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto overflow-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
        style={{
          content: {
            width: "50vw",
            maxHeight: "85vh",
            overflowY: "scroll",
          }
        }}
      >
        {/* <h1 className="mb-2">Spawn a custom card</h1> */}

        <form className="w-full" onSubmit={handleSubmit(onSubmit)}> 
          <label for="owner"><h2 className="text-white">Owner: </h2></label>
          <select className="form-control mb-1" style={{width:"35%"}} ref={register({ required: false })} id={"owner"} name={"owner"}>
            <option value="sharedEncounterDeck" selected>Encounter Deck</option>
            <option value="sharedEncounterDeck2">Encounter Deck 2</option>
            <option value="sharedEncounterDeck3">Encounter Deck 3</option>
            <option value="sharedQuestDeck">Quest Deck</option>
            <option value="sharedQuestDeck2">Quest Deck 2</option>
            <option value="player1Deck">Player 1</option>
            <option value="player2Deck">Player 2</option>
            <option value="player3Deck">Player 3</option>
            <option value="player4Deck">Player 4</option>
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