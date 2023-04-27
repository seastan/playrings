  defmodule DragnCardsGame.Game do
  @moduledoc """
  Represents a game of dragncards.
  In early stages of the app, it only represents a
  some toy game used to test everything around it.
  """
  import Ecto.Query
  alias DragnCardsGame.{Groups, Game, PlayerData}
  alias DragnCards.{Repo, Replay, Plugins}

  @type t :: Map.t()

  @doc """
  load/2:  Create a game with specified options.
  """
  @spec load(Map.t()) :: Game.t()
  def load(options) do
    game_def = Plugins.get_game_def(options["pluginId"])
    game = if options["replayId"] != nil and options["replayId"] != "" do
      gameid = options["replayId"]
      query = Ecto.Query.from(e in Replay,
        where: e.uuid == ^gameid,
        order_by: [desc: e.inserted_at],
        limit: 1)
      replay = Repo.one(query)
      if replay.game_json do replay.game_json else Game.new(options) end
    else
      Game.new(options)
    end
    # Refresh id so that replay does not get overwritten
    put_in(game["id"], Ecto.UUID.generate)
  end

  @doc """
  new/0:  Create a game with specified options.
  """
  @spec new() :: Game.t()
  def new() do
    %{}
  end
  @doc """
  new/2:  Create a game with specified options.
  """
  @spec new(Map.t()) :: Game.t()
  def new(options) do
    game_def = Plugins.get_game_def(options["pluginId"])
    default_layout_info = Enum.at(game_def["layoutMenu"],0)
    layout_id = default_layout_info["layoutId"]
    base = %{
      "id" => Ecto.UUID.generate,
      "pluginId" => options["pluginId"],
      "pluginVersion" => options["pluginVersion"],
      "numPlayers" => default_layout_info["numPlayers"],
      "roundNumber" => 0,
      "roomTitle" => "Unspecified",
      "layoutId" => layout_id,
      "layoutVariants" => game_def["layouts"][layout_id]["defaultVariants"] || %{},
      "firstPlayer" => "player1",
      "stepIndex" => 0,
      "groupById" => Groups.new(game_def["groups"]),
      "stackById" => %{},
      "cardById"  => %{},
      "latestMessages" => [],
      "options" => options,
      "variables" => %{},
      "automation" => %{},
      "messages" => []
    }
    # Add player data
    player_data = %{}
    player_data = Enum.reduce(1..game_def["maxPlayers"], player_data, fn(n, acc) ->
      put_in(acc["player"<>Integer.to_string(n)], PlayerData.new(game_def))
    end)
    base = put_in(base["playerData"], player_data)
    # Add custom properties
    game = Enum.reduce(game_def["gameProperties"], base, fn({key,val}, acc) ->
      put_in(acc[key], val["default"])
    end)
  end


end
