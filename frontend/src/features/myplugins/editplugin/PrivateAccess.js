import React, { useState } from 'react';
import AutocompleteItem from './AutocompleteItem';
import UserTag from './UserTag';
import useDataApi from '../../../hooks/useDataApi';
import AutocompleteInput from './AutocompleteInput';

const PrivateAccess = ({pluginId}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    '/be/api/v1/users/plugin_permission/' + pluginId,
    null
  );

  console.log('Rendering AutocompleteInput', pluginId, data)

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
        
        <AutocompleteInput inputValue={inputValue} setInputValue={setInputValue} updateSuggestions={updateSuggestions}/>
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

export default PrivateAccess;
