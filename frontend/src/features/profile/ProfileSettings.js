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
    //const href = `https://www.patreon.com/oauth2/become-patron?response_type=code${pledgeLevel}${clientId}${redirectUri}${v2Params}`;
    const href = `https://www.patreon.com/oauth2/become-patron?response_type=code&client_id=${patreonClientId}&redirect_uri=${redirectURI}&min_cents=500`;
    return (
      <a
        className="patreon-button link-button"
        data-patreon-widget-type="become-patron-button"
        href={href}
        rel="noreferrer"
        target="_blank">
        <svg
          id="patreon-logo"
          viewBox="10 0 2560 356"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink">
          <g>
            <path d="M1536.54 72.449v76.933h128.24v61.473h-128.24v74.51h128.24v62.921h-206.64V9.529h206.64v62.92h-128.24M2070.82 178.907c0-55.652-37.76-107.434-99.21-107.434-61.95 0-99.21 51.782-99.21 107.434s37.26 107.435 99.21 107.435c61.45 0 99.21-51.783 99.21-107.435zm-278.77 0c0-92.916 66.79-178.093 179.56-178.093 112.26 0 179.05 85.177 179.05 178.093 0 92.916-66.79 178.093-179.05 178.093-112.77 0-179.56-85.177-179.56-178.093zM186.32 131.97c0-31.46-21.299-58.563-54.206-58.563H78.398v117.109h53.716c32.907 0 54.206-27.086 54.206-58.546zM0 9.529h141.788c75.016 0 123.417 56.628 123.417 122.441s-48.401 122.423-123.417 122.423h-63.39v93.893H0V9.529zM492.17 106.314l-41.621 139.382h82.266L492.17 106.314zm73.081 241.972-13.054-41.134H431.69l-13.072 41.134h-83.73L455.882 9.529h72.105l122.442 338.757h-85.178zM782.055 77.277H705.61V9.529h231.793v67.748h-76.951v271.009h-78.397V77.277M2485.08 230.202V9.529h77.91v338.757h-81.78l-121.97-217.78v217.78h-78.4V9.529h81.78l122.46 220.673M1245.68 131.97c0-31.46-21.3-58.563-54.21-58.563h-53.72v117.109h53.72c32.91 0 54.21-27.086 54.21-58.546zM1059.36 9.529h142.29c75 0 123.4 56.628 123.4 122.441 0 47.425-25.17 89.517-67.28 109.369l67.77 106.947h-90.98l-60.03-93.893h-36.78v93.893h-78.39V9.529z" />
          </g>
        </svg>
      </a>
    );
  };

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

      <PatreonButton patreonClientId={"MUANs_lS4yBmji1txII2sV6NJ3X1JEp5OSzPVr_rkU02jz3S2jTubjoMOSPK5Jul"} amount={"500"} redirectURI={"https://www.dragncards.com/auth/patreon/callback"}/>

    </Container>

  );
};
export default ProfileSettings;
