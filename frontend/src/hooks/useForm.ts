import React, { useState } from "react";

const useForm = (submitCallback: () => void) => {
  let initialState: Record<string, string> = {};
  const [inputs, setInputs] = useState(initialState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    submitCallback();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    event.persist();
    event.stopPropagation(); 
    setInputs((inputs) => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };
  return {
    handleSubmit,
    handleInputChange,
    inputs,
    setInputs,
  };
};
export default useForm;
