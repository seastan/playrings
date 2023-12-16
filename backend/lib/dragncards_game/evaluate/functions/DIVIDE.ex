defmodule DragnCardsGame.Evaluate.Functions.DIVIDE do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'DIVIDE' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'DIVIDE' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'DIVIDE' operation.

  ## Returns

  The result of the 'DIVIDE' operation.
  """
  def execute(game, code, trace) do
    divisor = (Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["divisor"]) || 0)
    if divisor do (Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["dividend"]) || 0) / divisor else nil end
  end


end
    