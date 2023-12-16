defmodule DragnCardsGame.Evaluate.Functions.REMOVE_FROM_LIST_BY_VALUE do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'REMOVE_FROM_LIST_BY_VALUE' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'REMOVE_FROM_LIST_BY_VALUE' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'REMOVE_FROM_LIST_BY_VALUE' operation.

  ## Returns

  The result of the 'REMOVE_FROM_LIST_BY_VALUE' operation.
  """
  def execute(game, code, trace) do
    list = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["list"]) || []
    value = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["value"])
    Enum.filter(list, fn(x) -> x != value end)
  end


end
    