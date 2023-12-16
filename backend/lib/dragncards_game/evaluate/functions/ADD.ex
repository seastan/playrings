defmodule DragnCardsGame.Evaluate.Functions.ADD do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'ADD' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ADD' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'ADD' operation.

  ## Returns

  The result of the 'ADD' operation.
  """
  def execute(game, code, trace) do
    (Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["left"]) || 0) + (Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["right"]) || 0)
  end


end
    