defmodule DragnCardsGame.Evaluate.Functions.UNSET do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'UNSET' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'UNSET' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'UNSET' operation.

  ## Returns

  The result of the 'UNSET' operation.
  """
  def execute(game, code, trace) do
    path = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["path"])
    path_minus_key = Enum.slice(path, 0, Enum.count(path)-1)
    key_to_delete = Enum.at(path, -1)
    nested_map = get_in(game, path_minus_key)
    nested_map = Map.delete(nested_map, key_to_delete)
    put_in(game, path_minus_key, nested_map)
  end


end
    