defmodule DragnCardsGame.Evaluate.Functions.INCREASE_VAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'INCREASE_VAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'INCREASE_VAL' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'INCREASE_VAL' operation.

  ## Returns

  The result of the 'INCREASE_VAL' operation.
  """
  def execute(game, code, trace) do
    path = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["path"])
    delta = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["delta"]) || 0
    old_value = get_in(game, path) || 0
    Evaluate.put_by_path(game, path, old_value + delta, trace ++ ["put_by_path"])
  end


end
    