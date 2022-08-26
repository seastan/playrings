defmodule DragnCardsWeb.MyPluginsController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Plugin, Repo}

  action_fallback DragnCardsWeb.FallbackController

  def show(conn, %{"id" => user_id}) do
    IO.puts("here")
    # Faster to gather all columns except game_json

    my_plugins = if user_id != nil and user_id != "undefined" do
      query = from Plugin, order_by: [desc: :updated_at], where: [author_user_id: ^user_id], select: [:author_user_id, :plugin_uuid, :plugin_name, :version, :num_favorites, :public, :updated_at]
      Repo.all(query)
    else
      []
    end
    #IO.inspect(my_plugins)
    my_plugins = Enum.reduce(my_plugins, [], fn(plugin, acc) ->
      acc ++ [Map.from_struct(plugin) |> Map.delete(:__meta__)]
    end)
    json(conn, %{my_plugins: my_plugins})
  end

  # Create: Create plugin
  @spec create(Conn.t(), map()) :: Conn.t()
  #def create(conn, %{"user" => user}) do
  def create(conn, %{"plugin" => plugin_params}) do
    user = Pow.Plug.current_user(conn)
    IO.puts("user")
    IO.inspect(user)
    plugin_uuid = plugin_params["plugin_uuid"]
    user_id = user.id
    user_alias = user.alias
    query = from Plugin, order_by: [desc: :version], where: [plugin_uuid: ^plugin_uuid], select: [:author_user_id, :author_alias, :plugin_uuid, :plugin_name, :version, :num_favorites, :public]
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
      num_favorites: 0,
      public: plugin_params["public"]
    }
    IO.puts("updates")
    IO.inspect(updates)

    result =
      %Plugin{author_user_id: user_id, author_alias: user_alias, plugin_uuid: plugin_uuid}
      |> Plugin.changeset(updates)
      |> Repo.insert_or_update
    conn
    |> json(%{success: %{message: "Updated settings"}})
  end
end
