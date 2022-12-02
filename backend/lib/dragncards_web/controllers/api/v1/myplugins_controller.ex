defmodule DragnCardsWeb.MyPluginsController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Plugins, Plugins.Plugin, Repo}

  action_fallback DragnCardsWeb.FallbackController

  def show(conn, %{"id" => user_id}) do
    IO.puts("here")
    # Faster to gather all columns except game_json

    my_plugins = if user_id != nil and user_id != "undefined" do
      query = from Plugin,
        order_by: [desc: :updated_at],
        where: [author_id: ^user_id],
         select: [
          :id,
          :author_id,
          :name,
          :version,
          :num_favorites,
          :public,
          :updated_at
        ]
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
    case Plugins.create_plugin(plugin_params) do
      {:ok, struct} ->
        conn
        |> json(%{success: %{message: "Updated settings"}})
      {:error, changeset} ->
        IO.puts("ERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRROR")
        IO.inspect(changeset)
        conn
        |> json(%{error: %{message: "Update failed"}})
    end
  end


  # Update: Update plugin
  @spec update(Conn.t(), map()) :: Conn.t()
  def update(conn, %{"plugin" => plugin_params}) do
    user = Pow.Plug.current_user(conn)
    IO.puts("user")
    IO.inspect(user)
    plugin_id = plugin_params["plugin_id"]
    user_id = user.id
    query = from Plugin, order_by: [desc: :version], where: [plugin_id: ^plugin_id], select: [:id, :author_user_id, :plugin_id, :plugin_name, :version, :num_favorites, :public]
    prev_plugins = Repo.all(query)
    IO.puts("older")
    IO.inspect(prev_plugins)
    prev_plugin = Enum.at(prev_plugins, 0)
    prev_version = prev_plugin.version || 0
    updates = %{
      "version" => prev_version+1,
    }
    updates = if plugin_params["game_def"] != nil do put_in(updates["game_def"], plugin_params["game_def"]) else updates end
    updates = if plugin_params["game_def"]["pluginName"] != nil do put_in(updates["plugin_name"], plugin_params["game_def"]["pluginName"]) else updates end
    updates = if plugin_params["card_db"] != nil do put_in(updates["card_db"], plugin_params["card_db"]) else updates end
    updates = if plugin_params["public"] != nil do put_in(updates["public"], plugin_params["public"]) else updates end
    IO.puts("updates")
    IO.inspect(updates)

    result =
      prev_plugin
      |> Plugin.changeset(updates)
      |> Repo.insert_or_update
    conn
    |> json(%{success: %{message: "Updated settings"}})
  end


  # Update: Update plugin
  @spec delete(Conn.t(), map()) :: Conn.t()
  def delete(conn, %{"id" => plugin_id}) do
    IO.puts("conn")
    IO.inspect(conn)
    user = Pow.Plug.current_user(conn)
    #plugin = Repo.get(Plugin, plugin_id)
    plugin = Repo.one(from p in Plugin, select: [:plugin_id], where: p.id == ^plugin_id)
    IO.puts("plugin to delete")
    IO.inspect(plugin)
    plugin_id = plugin.plugin_id
    user_id = user.id
    user_alias = user.alias
    {rows_deleted, _} = from(x in Plugin, where: x.plugin_id == ^plugin_id and x.author_user_id == ^user_id) |> Repo.delete_all
    IO.puts("rows_deleted")
    IO.inspect(rows_deleted)
    conn
    |> json(%{success: %{message: "Updated settings"}})
  end
end
