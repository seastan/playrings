defmodule DragnCardsGame.Evaluate.Functions.MULTIPLY do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'MULTIPLY' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'MULTIPLY' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'MULTIPLY' operation.

  ## Returns

  The result of the 'MULTIPLY' operation.
  """
  def execute(game, code, trace) do
    (Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["left"]) || 0) * (Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["right"]) || 0)
  end


end
    