defmodule DragnCardsWeb.MyPluginsController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Plugin, Repo}

  action_fallback DragnCardsWeb.FallbackController

  def show(conn, %{"id" => user_id}) do
    IO.puts("here")
    # Faster to gather all columns except game_json
    query = from Plugin, order_by: [desc: :updated_at], where: [user_id: ^user_id], select: [:user_id, :plugin_uuid, :plugin_name, :version, :subscribers, :public]
    my_plugins = Repo.all(query)
    IO.inspect(my_plugins)
    json(conn, %{my_plugins: my_plugins})
  end

  # Create: Creat plugin
  @spec create(Conn.t(), map()) :: Conn.t()
  #def create(conn, %{"user" => user}) do
  def create(conn, %{"plugin" => plugin_params}) do
    user = Pow.Plug.current_user(conn)
    IO.puts("user")
    IO.inspect(user)
    plugin_uuid = plugin_params["plugin_uuid"]
    user_id = user.id
    query = from Plugin, order_by: [desc: :version], where: [plugin_uuid: ^plugin_uuid], select: [:user_id, :plugin_uuid, :plugin_name, :version, :subscribers, :public]
    prev_plugins = Repo.all(query)
    IO.puts("older")
    IO.inspect(prev_plugins)
    prev_plugin = Enum.at(prev_plugins, 0)
    prev_version = prev_plugin["version"] || 0
    updates = %{
      version: prev_version+1,
      plugin_name: plugin_params["game_def"]["pluginName"],
      game_def: plugin_params["game_def"],
      card_db: plugin_params["card_db"],
      subscribers: 0,
      public: plugin_params["public"]
    }
    IO.puts("updates")
    IO.inspect(updates)

    result =
      %Plugin{user_id: user_id, plugin_uuid: plugin_uuid}
      |> Plugin.changeset(updates)
      |> Repo.insert_or_update
    conn
    |> json(%{success: %{message: "Updated settings"}})
  end
end
