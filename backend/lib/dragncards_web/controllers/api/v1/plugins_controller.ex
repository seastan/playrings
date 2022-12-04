defmodule DragnCardsWeb.PluginsController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Plugins, Plugins.Plugin, Repo}

  action_fallback DragnCardsWeb.FallbackController

  def index(conn, _params) do
    conn
    plugins = Plugins.list_plugins_info()
    IO.puts("plugins.................")
    IO.inspect(plugins)
    render(conn, "index.json", plugins: plugins)
    #json(conn, %{plugins: nil})
  end

  @spec show(Conn.t(), map()) :: Conn.t()
  def show(conn, %{"plugin_id" => plugin_id}) do
    IO.puts("plugin_id.................................................................................")
    IO.inspect(plugin_id)
    conn
  end

  def get_plugin(conn, params) do
    IO.puts("get plugin")
    IO.inspect(params)
    {plugin_id, ""} = Integer.parse(params["plugin_id"])
    plugin = Repo.get_by(Plugin, id: plugin_id)
    #plugin = Plugins.get_plugin!(plugin_id)
    IO.puts("plugin id")
    IO.inspect(plugin.id)
    #plugin = Map.from_struct(plugin)
    render(conn, "single.json", plugin: plugin)
    #json(conn, %{plugins: nil})
  end

end
