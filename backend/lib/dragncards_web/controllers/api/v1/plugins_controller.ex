defmodule DragnCardsWeb.PluginsController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Plugins, Repo}

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
end
