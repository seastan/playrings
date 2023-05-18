import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import Container from "../../components/basic/Container";
import Button from "../../components/basic/Button";
import useProfile from "../../hooks/useProfile";
import useForm from "../../hooks/useForm";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { useAuthOptions } from "../../hooks/useAuthOptions";


export const ProfileSettings = () => {
  const user = useProfile();
  const authOptions = useAuthOptions();
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


  const PatreonButton = ({patreonClientId, amount, redirectURI}) => {
    const clientId = `&client_id=${patreonClientId}`;
    const pledgeLevel = `&min_cents=${amount}`;
    const v2Params = "&scope=identity%20identity[email]";
    const redirectUri = `&redirect_uri=${redirectURI}`;
    const href = `https://www.patreon.com/oauth2/become-patron?response_type=code${pledgeLevel}${clientId}${redirectUri}${v2Params}`;
    return (
      <a
        className="patreon-button link-button"
        data-patreon-widget-type="become-patron-button"
        href={href}
        rel="noreferrer"
        target="_blank">
        <img style={{height: "20px"}} src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg"/>
      </a>
    );
  };

  return (
    <Container>
      <div className="bg-gray-100 p-4 rounded max-w-xl shadow">
      <h1 className="font-semibold mb-4 text-black">Settings</h1>
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
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
            </select>
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

      <PatreonButton patreonClientId={"MUANs_lS4yBmji1txII2sV6NJ3X1JEp5OSzPVr_rkU02jz3S2jTubjoMOSPK5Jul"} amount={1000} redirectURI={"https://www.dragncards.com/auth/patreon/callback"}/>

    </Container>

  );
};
export default ProfileSettings;
