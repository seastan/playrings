defmodule DragnCardsWeb.PluginsView do
  use DragnCardsWeb, :view
  alias DragnCardsWeb.PluginsView

  def render("index.json", %{plugins: plugins}) do
    %{data: Enum.map(plugins, fn plugin ->
      IO.puts("YYYYYYYYYYYYYYYYYYYYYYY")
      IO.inspect(plugin)
      {
        author_user_id,
        author_alias,
        plugin_uuid,
        plugin_name,
        version,
        num_favorites,
        public,
        updated_at
      } = plugin
      %{
        plugin_uuid: plugin_uuid,
        plugin_name: plugin_name,
        num_favorites: num_favorites,
        public: public,
        updated_at: updated_at,
        author_user_id: author_user_id,
        author_alias: author_alias,
        version: version,
      }
    end)}
    #%{data: render_many(plugins, PluginsView, "plugin.json")} # This wasn't working for some reason
  end
  def render("single.json", %{plugin: plugin}) do
    plugin
    #%{data: render_many(plugins, PluginsView, "plugin.json")} # This wasn't working for some reason
  end

#  def render("show.json", %{plugin: plugin}) do
#    %{data: render_one(plugin, PluginsView, "plugin.json")}
#  end

#  def render("plugin.json", %{plugin: plugin}) do
#    %{
#      plugin_uuid: plugin.plugin_uuid,
#      plugin_name: plugin.plugin_name,
#      num_favorites: plugin.num_favorites,
#      user_id: plugin.user_id,
#    }
#  end
end
