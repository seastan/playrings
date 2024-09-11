defmodule DragnCardsGame.PluginCache do
  use GenServer
  alias DragnCards.{Plugins}

  @table_name :card_db_cache

  # Start the GenServer and initialize the ETS table
  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  # Initialize the ETS table when the GenServer starts
  def init(_) do
    :ets.new(@table_name, [:set, :public, :named_table])
    {:ok, %{}}
  end

  # Public function to get cached card_db, or fetch if not present
  def get_plugin_cached(plugin_id) do
    case :ets.lookup(@table_name, plugin_id) do
      [{^plugin_id, plugin}] ->
        # If found in cache, return it
        plugin

      [] ->
        # If not in cache, fetch and store it
        plugin = Plugins.get_plugin!(plugin_id)
        :ets.insert(@table_name, {plugin_id, plugin})
        plugin
    end
  end

  def get_game_def_cached(plugin_id) do
    plugin = get_plugin_cached(plugin_id)
    plugin.game_def
  end

  # Public function to get cached card_db, or fetch if not present
  def get_card_db_cached(plugin_id) do
    plugin = get_plugin_cached(plugin_id)
    plugin.card_db
  end

  def get_card_cached(plugin_id, card_db_id) do
    card_db = get_card_db_cached(plugin_id)
    {:ok, card_db[card_db_id]}
  end
end
