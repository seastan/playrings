import apiGet from "./apiGet";
import { AuthContextType } from "../contexts/AuthContext";
import { User } from "elixir-backend";

const getUser = async (userId: number, authCtx: AuthContextType) => {
  const url = "/be/api/v1/profile/" + userId;
  console.log("getUser 1",url)
  const result = await apiGet(url, authCtx);
  const user: User = result.data.user_profile;
  console.log("getUser 2", user)
  return user;
};
export default getUser;
