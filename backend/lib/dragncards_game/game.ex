  defmodule DragnCardsGame.Game do
  @moduledoc """
  Represents a game of dragncards.
  In early stages of the app, it only represents a
  some toy game used to test everything around it.
  """
  require Logger
  import Ecto.Query
  alias ElixirSense.Log
  alias DragnCardsGame.{Groups, Game, PlayerData, GameVariables}
  alias DragnCards.{Repo, Replay, Plugins, Users}

  @type t :: Map.t()

  @doc """
  load/2:  Create a game with specified options.
  """
  @spec load(String.t(), integer(), Map.t(), Map.t()) :: Game.t()
  def load(room_slug, user_id, game_def, options) do
    Logger.debug("Loading Game")
    Logger.debug("Options: #{inspect(options)}")
    game = if options["replayUuid"] != nil do
      replay_uuid = options["replayUuid"]
      query = from(e in Replay,
        where: e.uuid == ^replay_uuid,
        order_by: [desc: e.inserted_at],
        limit: 1)
      replay = Repo.one(query)
      if replay.game_json do replay.game_json else Game.new(room_slug, user_id, game_def, options) end
      # TODO: Set room name
    else
      Game.new(room_slug, user_id, game_def, options)
    end
    # Refresh id so that replay does not get overwritten
    put_in(game["id"], Ecto.UUID.generate)
  end

  @doc """
  new/2:  Create a game with specified options.
  """
  @spec new(String.t(), integer(), Map.t(), Map.t()) :: Game.t()
  def new(room_slug, user_id, game_def, options) do
    Logger.debug("Making new Game")
    default_layout_info = Enum.at(game_def["layoutMenu"],0)
    Logger.debug("Got default layout info")
    layout_id = default_layout_info["layoutId"]
    Logger.debug("Got layout id #{layout_id}")
    groups = Groups.new(game_def)
    Logger.debug("Made groups")
    automation = if get_in(game_def, ["automation", "gameRules"]) do %{"_game_" => %{"rules" => game_def["automation"]["gameRules"]}} else %{} end
    Logger.debug("Made automation")
    step_id =
      game_def
      |> Map.get("stepOrder", [])
      |> Enum.at(0, nil)
    Logger.debug("Got step id #{step_id}")
    base = try do
    %{
      "id" => Ecto.UUID.generate,
      "roomSlug" => room_slug,
      "roomName" => room_slug,
      "pluginId" => options["pluginId"],
      "pluginVersion" => options["pluginVersion"],
      "pluginName" => options["pluginName"],
      "numPlayers" => default_layout_info["numPlayers"],
      "roundNumber" => 0,
      "layoutId" => layout_id,
      "layoutVariants" => game_def["layouts"][layout_id]["defaultVariants"] || %{},
      "firstPlayer" => "player1",
      "stepId" => step_id,
      "steps" => Map.get(game_def, "steps", %{}),
      "stepOrder" => Map.get(game_def, "stepOrder", []),
      "phases" => Map.get(game_def, "phases", %{}),
      "phaseOrder" => Map.get(game_def, "phaseOrder", []),
      "tokenById" => Map.get(game_def, "tokens", %{}),
      "textBoxById" => game_def["textBoxes"],
      "groupById" => groups,
      "stackById" => %{},
      "cardById"  => %{},
      "currentScopeIndex" => 0,
      "imageUrlPrefix" => game_def["imageUrlPrefix"],
      "options" => options,
      "loadedADeck" => false,
      "loadedCardIds" => [],
      "variables" => GameVariables.default(),
      "functions" => game_def["functions"] || %{},
      "automation" => automation,
      "messages" => [] # These messages will be delivered to the GameUi parent, which will then relay them to chat
    }
    rescue
      e in KeyError ->
        IO.puts("Error: #{inspect(e)}")
      _ ->
        IO.puts("Error detected")
    end
    Logger.debug("Made new Game")
    # Add player data
    player_data = %{}
    player_data = Enum.reduce(1..game_def["maxPlayers"], player_data, fn(n, acc) ->
      put_in(acc["player"<>Integer.to_string(n)], PlayerData.new(game_def))
    end)
    Logger.debug("Made player data")
    base = put_in(base["playerData"], player_data)
    # Add custom properties
    game = Enum.reduce(Map.get(game_def, "gameProperties", %{}), base, fn({key,val}, acc) ->
      put_in(acc[key], val["default"])
    end)
    Logger.debug("Made custom properties")

    # If the user has some default game settings, apply them
    user = Users.get_user(user_id)
    plugin_id = options["pluginId"]
    user_game_settings = user.plugin_settings["#{plugin_id}"]["game"]
    game = if user_game_settings != nil do

      Enum.reduce(user_game_settings, game, fn({key, val}, acc) ->
        put_in(acc, [key], val)
      end)
    else
      game
    end
    Logger.debug("Set game settings")
    game
  end

  def is_healthy(game) do
    if get_in(game,["cardById"]) == nil do
      IO.puts("Game is NOT healthy")
    else
      IO.puts("Game is healthy")
    end
  end

end
