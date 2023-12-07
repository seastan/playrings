defmodule DragnCardsGame.Evaluate.Functions.SUBTRACT do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'SUBTRACT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SUBTRACT' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'SUBTRACT' operation.

  ## Returns

  The result of the 'SUBTRACT' operation.
  """
  def execute(game, code, trace) do
    (Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["left"]) || 0) - (Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["right"]) || 0)
  end


end
    