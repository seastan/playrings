import React, { useState } from 'react';
import AutocompleteItem from './AutocompleteItem';
import UserTag from './UserTag';

const AutocompleteInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Mocked user alias list
  const allUsers = ['alice', 'bob', 'carol', 'dave', 'alice1', 'alice2', 'alice3', 'alice4', 'alice5'];

  const updateSuggestions = (value) => {
    if (value) {
      const newSuggestions = allUsers.filter((user) =>
        user.toLowerCase().startsWith(value.toLowerCase())
      );
      // Remove suggestions that are already selected
      const filteredSuggestions = newSuggestions.filter(
          (suggestion) => !selectedUsers.includes(suggestion)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const addUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setInputValue('');
    setSuggestions([]);
  };

  const removeUser = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u !== user));
  };

  return (
    <div>
      <div className="flex flex-wrap">
        {selectedUsers.map((user, index) => (
          <UserTag key={index} onRemove={() => removeUser(user)}>
            {user}
          </UserTag>
        ))}
        <input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            updateSuggestions(e.target.value);
          }}
          className="border p-1 my-1"
        />
      </div>
      <div className='mt-1'>
        {suggestions.map((suggestion, index) => (
          <AutocompleteItem key={index} onClick={() => addUser(suggestion)}>
            {suggestion}
          </AutocompleteItem>
        ))}
      </div>
    </div>
  );
};

export default AutocompleteInput;
