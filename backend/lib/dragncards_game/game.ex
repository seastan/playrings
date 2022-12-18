  defmodule DragnCardsGame.Game do
  @moduledoc """
  Represents a game of dragncards.
  In early stages of the app, it only represents a
  some toy game used to test everything around it.
  """
  import Ecto.Query
  alias DragnCardsGame.{Groups, Game, PlayerData}
  alias DragnCards.{Repo, Replay}

  @type t :: Map.t()

  @doc """
  load/2:  Create a game with specified options.
  """
  @spec load(Map.t(), Map.t()) :: Game.t()
  def load(game_def, options) do
    game = if options["replayId"] != nil and options["replayId"] != "" do
      gameid = options["replayId"]
      query = Ecto.Query.from(e in Replay,
        where: e.uuid == ^gameid,
        order_by: [desc: e.inserted_at],
        limit: 1)
      replay = Repo.one(query)
      if replay.game_json do replay.game_json else Game.new(options) end
    else
      Game.new(game_def, options)
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
  @spec new(Map.t(), Map.t()) :: Game.t()
  def new(game_def, options) do
    default_layout = Enum.at(game_def["layoutMenu"],0)
    base = %{
      "id" => Ecto.UUID.generate,
      "pluginId" => options["pluginId"],
      "pluginVersion" => options["pluginVersion"],
      "numPlayers" => 1,
      #"questModeAndId" => nil,
      "roomTitle" => "Unspecified",
      "layout" => game_def["layouts"][default_layout["layoutId"]],
      "firstPlayer" => "player1",
      "roundNumber" => 0,
      "stepIndex" => 0,
      "groupById" => Groups.new(game_def["groups"]),
      "stackById" => %{},
      "cardById"  => %{},
      "triggerMap" => %{},
      "deltas" => [],
      "replayStep" => 0,
      "replayLength" => 0, # Length of deltas. We need this because the delta array is not broadcast.
      "latestMessages" => [],
      "victoryState" => nil,
      "questMode" => "Normal",
      "options" => options,
      "actionLists" => game_def["actionLists"],
      "variables" => %{},
      "messages" => []
    }
    # Add player data
    player_data = %{}
    player_data = Enum.reduce(game_def["minPlayers"]..game_def["maxPlayers"], player_data, fn(n, acc) ->
      put_in(acc["player"<>Integer.to_string(n)], PlayerData.new(game_def))
    end)
    base = put_in(base["playerData"], player_data)
    # Add custom properties
    game = Enum.reduce(game_def["gameProperties"], base, fn({key,val}, acc) ->
      put_in(acc[key], val["default"])
    end)
  end

  def add_delta(game, prev_game) do
    #IO.puts("deltas")
    #IO.inspect(game)
    ds = game["deltas"]
    num_deltas = Enum.count(ds)
    new_step = prev_game["replayStep"]+1
    new_step = if new_step > num_deltas+1 do
      num_deltas+1
    else new_step end
    game = put_in(game["replayStep"], new_step)
    game = put_in(game["replayLength"], new_step)
    d = get_delta(prev_game, game)
    if d do
      # add timestamp to delta
      timestamp = System.system_time(:millisecond)
      d = put_in(d["unix_ms"], "#{timestamp}")
      ds = Enum.slice(ds, Enum.count(ds)-game["replayStep"]+1..-1)
      ds = [d | ds]
      game = put_in(game["deltas"], ds)
    else
      game
    end
  end

  def step(game, direction) do
    case direction do
      "undo" ->
        undo(game)
      "redo" ->
        redo(game)
      _ ->
        game
    end
  end

  def undo(game) do
    replay_step = game["replayStep"]
    if replay_step > 0 do
      ds = game["deltas"]
      d = Enum.at(ds,Enum.count(ds)-replay_step)
      game = apply_delta(game, d, "undo")
      game = put_in(game["replayStep"], replay_step-1)
    else
      game
    end
  end

  def redo(game) do
    replay_step = game["replayStep"]
    ds = game["deltas"]
    if replay_step < Enum.count(ds) do
      d = Enum.at(ds,Enum.count(ds)-replay_step-1)
      game = apply_delta(game, d, "redo")
      game = put_in(game["replayStep"], replay_step+1)
    else
      game
    end
  end

  def get_delta(game_old, game_new) do
    game_old = Map.delete(game_old, "deltas")
    game_new = Map.delete(game_new, "deltas")
    diff_map = MapDiff.diff(game_old, game_new)
    delta("game", diff_map)
  end

  def delta(key, diff_map) do
    case diff_map[:changed] do
      :equal ->
        nil
      :added ->
        [":removed", diff_map[:value]]
      # TODO: Check that removal behaves properly
      :removed ->
        [diff_map[:value], ":removed"]
      :primitive_change ->
        [diff_map[:removed],diff_map[:added]]
      :map_change ->
        diff_value = diff_map[:value]
        Enum.reduce(diff_value, %{}, fn({k,v},acc) ->
          d2 = delta(k, v)
          if v[:changed] != :equal and k != "playerUi" do
            acc |> Map.put(k, d2)
          else
            acc
          end
        end)
        _ ->
          nil
    end
  end

  def apply_delta(map, delta, direction) do
    if is_map(map) and is_map(delta) do
      delta = Map.delete(delta, "unix_ms")
      # Loop over keys in delta and apply the changes to the map
      Enum.reduce(delta, map, fn({k, v}, acc) ->
        if is_map(v) do
          put_in(acc[k], apply_delta(map[k], v, direction))
        else
          new_val = if direction == "undo" do
            Enum.at(v,0)
          else
            Enum.at(v,1)
          end
          if new_val == ":removed" do
            Map.delete(acc, k)
          else
            put_in(acc[k], new_val)
          end
        end
      end)
    else
      IO.puts("undo error")
      IO.inspect(map)
      IO.puts("delta")
      IO.inspect(delta)
      map
    end
  end

  def apply_delta_list(game, delta_list, direction) do
    Enum.reduce(delta_list, game, fn(delta, acc) ->
      apply_delta(acc, delta, direction)
    end)
  end

  def apply_deltas_until_round_change(game, direction) do
    deltas = game["deltas"]
    round_init = game["roundNumber"]
    Enum.reduce_while(deltas, game, fn(delta, acc) ->
      replay_step = acc["replayStep"]
      # Check if we run into the beginning/end
      cond do
        direction == "undo" and replay_step == 0 ->
          {:halt, acc}
        direction == "redo" and replay_step == Enum.count(deltas) ->
          {:halt, acc}
      # Check if round has changed
        acc["roundNumber"] != round_init ->
          {:halt, acc}
      # Otherwise continue
        true ->
          {:cont, step(acc, direction)}
      end
    end)
  end

end
