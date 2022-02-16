defmodule DragnCardsWeb.API.V1.ProfileController do
  use DragnCardsWeb, :controller
  alias DragnCards.{Users, Repo}
  alias DragnCards.Users.User
  alias Plug.Conn

  # Index: Get my own private profile.
  @spec index(Conn.t(), map()) :: Conn.t()
  def index(conn, _params) do
    user = Pow.Plug.current_user(conn)

    case user do
      nil ->
        conn
        |> put_status(401)
        |> json(%{error: %{code: 401, message: "Not authenticated"}})

      _ ->
        json(conn, %{user_profile: User.to_my_profile(user)})
    end
  end

  # Show: Look up the public profile of another user.
  @spec show(Conn.t(), map()) :: Conn.t()
  def show(conn, %{"id" => user_id}) do
    user = Users.get_user(user_id)

    case user do
      nil ->
        conn
        |> put_status(404)
        |> json(%{error: %{code: 404, message: "Not Found"}})

      _ ->
        json(conn, %{user_profile: User.to_public_profile(user)})
    end
  end

  # Update: Update profile settings.
  @spec update(Conn.t(), map()) :: Conn.t()
  #def update(conn, %{"user" => user}) do
  def update(conn, %{"user" => user_params}) do
    user_id = user_params["id"]
    u = Repo.get!(User, user_id)
    updates = %{
      background_url: user_params["background_url"],
      player_back_url: user_params["player_back_url"],
      encounter_back_url: user_params["encounter_back_url"],
      language: user_params["language"],
      hidden_tooltips: user_params["hidden_tooltips"] || u.hidden_tooltips
    }
    u = Ecto.Changeset.change(u, updates)
    case Repo.update(u) do
      {:ok, _struct}       -> # Updated with success
        Pow.Plug.update_user(conn, %{}) # Refresh the session
        conn
        |> json(%{success: %{message: "Updated settings"}})
      {:error, changeset} -> # Something went wrong
        conn
        |> json(%{success: %{message: "Failed to update settings"}})
    end



    # IO.puts("r")
    # IO.inspect("r")
    # conn
    # |> json(%{success: %{message: "Updated user"}})
    # user_id = user["id"]
    # u = Repo.get!(User, user_id)
    # updates = %{
    #   background_url: user["background_url"],
    #   player_back_url: user["player_back_url"],
    #   encounter_back_url: user["encounter_back_url"],
    #   language: user["language"],
    #   hidden_tooltips: user["hidden_tooltips"] || u.hidden_tooltips
    # }
    # u = Ecto.Changeset.change(u, updates)
    # case Repo.update(u) do
    #   {:ok, _struct}       -> # Updated with success
    #     conn
    #     |> json(%{success: %{message: "Updated settings"}})
    #   {:error, changeset} -> # Something went wrong
    #     IO.inspect(changeset, label: "Failed to update settings")
    #     conn
    #     |> json(%{success: %{message: "Failed to update settings"}})
    # end

  end
end
