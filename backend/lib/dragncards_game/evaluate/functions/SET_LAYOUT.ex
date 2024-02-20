defmodule DragnCardsGame.Evaluate.Functions.SET_LAYOUT do
  alias DragnCardsGame.Evaluate
  alias DragnCards.Plugins
  @moduledoc """
  Handles the 'SET_LAYOUT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SET_LAYOUT' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'SET_LAYOUT' operation.

  ## Returns

  The result of the 'SET_LAYOUT' operation.
  """
  def get_layout_from_game_def(plugin_id, layout_id) do
    game_def = Plugins.get_game_def(plugin_id)
    game_def["layouts"][layout_id]
  end

  def execute(game, code, trace) do
    player_i = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["player_i"])
    layout_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["layout_id"])
    layout = get_layout_from_game_def(game["options"]["pluginId"], layout_id)
    case player_i do
      "shared" ->
        # Update the shared layout
        game = game
        |> Evaluate.evaluate(["SET", "/layoutId", layout_id])
        |> Evaluate.evaluate(["SET", "/layout", layout])

        # Update the player layouts
        Enum.reduce(game["playerData"], game, fn({player_i, _player_data}, acc) ->
          Evaluate.evaluate(acc, ["SET_LAYOUT", player_i, layout_id], trace)
        end)
      _ ->
        game
        |> Evaluate.evaluate(["SET", "/playerData/#{player_i}/layoutId", layout_id])
        |> Evaluate.evaluate(["SET", "/playerData/#{player_i}/layout", layout])
    end
  end


end
