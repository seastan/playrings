defmodule DragnCardsWeb.PluginsController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Plugin, Repo}

  action_fallback DragnCardsWeb.FallbackController

  def index(conn, _params) do
    conn
    plugins = Plugin.list_plugins()
    IO.puts("plugins.................")
    IO.inspect(plugins)
    render(conn, "index.json", plugins: plugins)
    #json(conn, %{plugins: nil})
  end

  @spec show(Conn.t(), map()) :: Conn.t()
  def show(conn, %{"plugin_uuid" => plugin_uuid}) do
    IO.puts("plugin_uuid.................................................................................")
    IO.inspect(plugin_uuid)
    conn
  end

  def get_plugin_by_uuid_and_version(conn, params) do
    conn
    plugin = Plugin.get_by_uuid_and_version(params["plugin_uuid"], params["plugin_version"])
    IO.puts("params.................................................................................")
    IO.inspect(params)
    render(conn, "single.json", plugin: plugin)
    #json(conn, %{plugins: nil})
  end
end
