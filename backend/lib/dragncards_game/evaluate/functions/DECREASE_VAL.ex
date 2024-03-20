defmodule DragnCardsGame.Evaluate.Functions.DECREASE_VAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. path (string)
  2. delta (number)

  Decreases the value at the given path by the given delta. If the current value at the given path is null, it is treated as 0.

  *Returns*:
  (game state) The game state with the value at the given path decreased by the given delta.
  """

  @doc """
  Executes the 'DECREASE_VAL' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'DECREASE_VAL' operation.

  ## Returns

  The result of the 'DECREASE_VAL' operation.
  """
  def execute(game, code, trace) do
    path = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["path"])
    delta = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["delta"])
    old_value = get_in(game, path) || 0
    Evaluate.put_by_path(game, path, old_value - delta, trace ++ ["put_by_path"])
  end


end
