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
    game = try do
      Evaluate.put_by_path(game, path, value, trace ++ ["put_by_path shared"])
    rescue
      _ ->
        Evaluate.evaluate(game, ["LOG", "WARNING: Could not update layout at path: #{path} with value: #{value}"])
    end
    # Loop over key/values in the playerData and update the layout
    Enum.reduce(game["playerData"], game, fn({player_i, _player_data}, acc) ->
      player_path = ["playerData", player_i] ++ path
      IO.puts("player_path: #{inspect(player_path)} value: #{inspect(value)}")
      try do # Not all players' layouts will have the region defined
        Evaluate.put_by_path(acc, player_path, value, trace ++ ["put_by_path player_i"])
      rescue
        _ ->
          acc
          #Evaluate.evaluate(acc, ["LOG", "WARNING: Could not update layout at path: #{player_path} with value: #{value}"])
      end
    end)
  end


end
