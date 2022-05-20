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
end
