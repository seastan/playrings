defmodule DragnCardsGame.Evaluate.Functions.GET_INDEX do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'GET_INDEX' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'GET_INDEX' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'GET_INDEX' operation.

  ## Returns

  The result of the 'GET_INDEX' operation.
  """
  def execute(game, code, trace) do
    list = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["list"])
    value = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["value"])
    Enum.find_index(list, fn(x) -> x == value end)
  end


end
    