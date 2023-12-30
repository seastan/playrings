import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import Container from "../../components/basic/Container";
import Button from "../../components/basic/Button";
import useProfile from "../../hooks/useProfile";
import useForm from "../../hooks/useForm";
import axios from "axios";
import useAuth from "../../hooks/useAuth";


export const ProfileSettings = () => {
  const user = useProfile();
  const { authToken, renewToken, setAuthAndRenewToken } = useAuth();
  const authOptions = useMemo(
    () => ({
      headers: {
        Authorization: authToken,
      },
    }),
    [authToken]
  );
  const history = useHistory();
  const required_support_level = 5;
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showResolutionMessage, setShowResolutionMessage] = useState(false);
  const { inputs, handleSubmit, handleInputChange, setInputs } = useForm(async () => {
    var valid = true;
    [inputs.background_url, inputs.player_back_url, inputs.encounter_back_url].forEach((str) => {
      if (str && !str.endsWith(".png") && !str.endsWith(".jpg")) valid = false;
    })
    if (!valid) {
      setErrorMessage("All images must be .jpg or .png");
      return;
    }
    const updateData = {
      user: {
        ...user,
        id: user?.id,
        language: inputs.language,
        background_url: inputs.background_url,
        player_back_url: inputs.player_back_url,
        encounter_back_url: inputs.encounter_back_url,
      },
    };
    //const res = await axios.post("/be/api/v1/profile/update", data);
    const res = await axios.post("/be/api/v1/profile/update", updateData, authOptions);
    const newProfileData = {
      user_profile: {
        ...user,
        id: user?.id,
        language: inputs.language,
        background_url: inputs.background_url,
        player_back_url: inputs.player_back_url,
        encounter_back_url: inputs.encounter_back_url,
      }}
    user.setData(newProfileData);
    if (
      res.status === 200
    ) {
      setSuccessMessage("Settings updated.");
      setErrorMessage("");
    } else {
      setSuccessMessage("");
      setErrorMessage("Error."); 
    }
    
  });
  useEffect(() => {
    if (user) {
      setInputs((inputs) => ({
        ...inputs,
        language: user.language || "",
        background_url: user.background_url || "",
        player_back_url: user.player_back_url || "",
        encounter_back_url: user.encounter_back_url || "",
      }));
    }
  }, [user]);
  if (user == null) {
    return null;
  }
  console.log('Rendering ProfileSettings');
  if (inputs.language === "English_HD" && user.supporter_level < 5 && user.language !== "English_HD") {
    setInputs({...inputs, language: user.language || ""})
    setShowResolutionMessage(true);
  }
  return (
    <Container>
      <div className="bg-gray-100 p-4 rounded max-w-xl shadow">
      <h1 className="font-semibold mb-4 text-black">Customization</h1>
      <form action="POST" onSubmit={handleSubmit}>
        <fieldset>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Card Images
            </label>
            <select 
              name="language"
              className="form-control w-full"
              onChange={handleInputChange}
              value={inputs.language || "English"}>
              <option value="English">English</option>
              <option value="English_HD">English (High Resolution)</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="Chinese">Chinese</option>
            </select>
            {showResolutionMessage && <div className="alert alert-danger mt-4">High resolution images are only available to certain Patreon supporters.</div>}
            <label className="block text-sm font-bold mb-2 mt-4">
              Background image url
            </label>
            <input
              disabled={user.supporter_level < required_support_level}
              name="background_url"
              className="form-control w-full mb-2"
              onChange={handleInputChange}
              value={inputs.background_url || ""}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Player card back image url
            </label>
            <input
              disabled={user.supporter_level < required_support_level}
              name="player_back_url"
              className="form-control w-full"
              onChange={handleInputChange}
              value={inputs.player_back_url || ""}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Encounter card back image url
            </label>
            <input
              disabled={user.supporter_level < required_support_level}
              name="encounter_back_url"
              className="form-control w-full"
              onChange={handleInputChange}
              value={inputs.encounter_back_url || ""}
            />
          </div>
          <div className="flex items-center justify-between">
              <Button isSubmit isPrimary className="mx-2">
                Update
              </Button>
            {user.supporter_level < required_support_level &&
              <Button isPrimary className="mx-2">
                <img className="inline-block mr-2" style={{height: "20px", width: "20px"}} src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg"/>
                <a className="text-white no-underline" href="https://www.patreon.com/dragncards">Unlock all</a>
              </Button> 
            }
          </div>
        </fieldset>
      </form>
      {errorMessage && (
        <div className="alert alert-danger mt-4">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert alert-info mt-4">{successMessage}</div>
      )}
      </div>
    </Container>

  );
};
export default ProfileSettings;
