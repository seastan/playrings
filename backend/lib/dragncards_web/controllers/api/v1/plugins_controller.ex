defmodule Compress do
  @spec gzip(term()) :: binary()
  def gzip(data) when is_binary(data) do
    :zlib.gzip(data)
  end
end


defmodule DragnCardsWeb.PluginsController do
  use DragnCardsWeb, :controller

  alias DragnCards.{Plugins, Plugins.Plugin, Repo}

  action_fallback DragnCardsWeb.FallbackController

  def index(conn, _params) do
    plugins = Plugins.list_plugins_info()
    render(conn, "index.json", plugins: plugins)
    #json(conn, %{plugins: nil})
  end

  @spec show(Conn.t(), map()) :: Conn.t()
  def show(conn, %{"plugin_id" => _plugin_id}) do
    conn
  end

  def get_plugin(conn, params) do
    IO.puts("get_plugin 1")
    IO.inspect(params)
    {plugin_id, ""} = Integer.parse(params["plugin_id"])
    IO.puts("get_plugin 2")
    IO.inspect(plugin_id)
    plugin = Repo.get_by(Plugin, id: plugin_id)

    #compressed_data = Compress.gzip(Jason.encode!(plugin))
    original_data = Jason.encode!(plugin)
    compressed_data = Compress.gzip(original_data)

    conn
    |> put_resp_header("content-encoding", "gzip")
    |> send_resp(200, compressed_data)
  end

  def get_plugin_info(conn, params) do
    IO.puts("get_plugin 1")
    IO.inspect(params)
    {plugin_id, ""} = Integer.parse(params["plugin_id"])
    IO.puts("get_plugin 2")
    IO.inspect(plugin_id)
    plugin = Plugins.get_plugin_info(plugin_id)
    IO.puts("get_plugin 3")
    IO.inspect(plugin)
    render(conn, "single_info.json", plugin: plugin)

    #plugins = Plugins.list_plugins_info()
    #render(conn, "index.json", plugins: plugins)
  end

end
