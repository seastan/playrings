import React, { useState } from "react";
import Select from 'react-select'
import ReactModal from "react-modal";
import { GROUPSINFO } from "./Constants";

const options = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'playtest', label: 'Playtest' },
]


export const FavoriteGroupModal = ({ 
  isOpen,
  closeModal,
  favoriteGroupId,
  setFavoriteGroupId,
  setSideGroupId
}) => {

  const [selected, setSelected] = useState(null);

  const groupIds = [
    "sharedQuestDeck",
    "sharedEncounterDeck2",
    "sharedEncounterDeck3",
    "player1Hand",
    "player1Discard",
    "player2Hand", 
    "player2Discard",
    "player3Hand", 
    "player3Discard",
    "player4Hand",
    "player4Discard",
    "sharedOther",
  ]

  const options = [];
  groupIds.forEach(groupId => {
    options.push({value: groupId, label: GROUPSINFO[groupId].name})
  });

  const handleDropdownChange = (entry) => {
    setFavoriteGroupId(entry.value);
    setSideGroupId(entry.value);
    setSelected(entry);
  }

  return (
    <ReactModal
      closeTimeoutMS={200}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Select favorite group"
      overlayClassName="fixed inset-0 bg-black-50 z-10000"
      className="insert-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
      style={{
        overlay: {
        },
        content: {
          width: '300px',
        }
      }}>

      <h1 className="mb-2">Select favorite group</h1>
      <div className="text-white m-1 mb-4">
      Choose what group this button will open. You can reset it by refreshing your browser.
      </div>
      <div className="mb-4">
        <Select         
          value={selected}
          onChange={handleDropdownChange}
          options={options} />
      </div>
    </ReactModal>
  );
};
