defmodule DragnCardsGame.Evaluate.Functions.UPDATE_LAYOUT do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'UPDATE_LAYOUT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'UPDATE_LAYOUT' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'UPDATE_LAYOUT' operation.

  ## Returns

  The result of the 'UPDATE_LAYOUT' operation.
  """
  def execute(game, code, trace) do
    path = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["path"])
    value = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["value"])
    game = Evaluate.put_by_path(game, path, value, trace ++ ["put_by_path shared"])
    # Loop over key/values in the playerData and update the layout
    Enum.reduce(game["playerData"], game, fn({player_i, _player_data}, acc) ->
      player_path = ["playerData", player_i] ++ path
      Evaluate.put_by_path(acc, player_path, value, trace ++ ["put_by_path player_i"])
    end)
  end


end
