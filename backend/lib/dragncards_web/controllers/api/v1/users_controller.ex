defmodule DragnCardsWeb.API.V1.UsersController do
  use DragnCardsWeb, :controller

  alias DragnCards.Repo
  alias DragnCards.Users.User
  alias DragnCards.UserPluginPermission
  alias DragnCards.Replay

  import Ecto.Query

  def fetch_plugin_permission(conn, %{"plugin_id" => plugin_id}) do
    IO.puts("fetch_plugin_permission 1")

    # query = from u in User,
    # join: upa in UserPluginPermission,
    # on: [id: u.id],
    # select: %{
    #   user_id: u.id
    # }
    # IO.puts("fetch_plugin_permission 2")
    # Repo.all(query)

    #query = from u in User, join: upa in UserPluginPermission, on: upa.user_id == u.id, select: %{user_id: u.id}

    query = from u in User,
      left_join: upa in UserPluginPermission, on: upa.user_id == u.id,
      where: is_nil(upa.private_access) or upa.private_access == ^plugin_id,
      select: %{user_id: u.id, private_access: not is_nil(upa.private_access)}

    result = Repo.all(query)
      |> Enum.into(%{}, fn %{user_id: user_id, private_access: private_access} -> {user_id, private_access} end)

    IO.puts("fetch_plugin_permission 3")

    json(conn, %{data: result})
  end
end
