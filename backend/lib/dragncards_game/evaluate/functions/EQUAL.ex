defmodule DragnCardsGame.Evaluate.Functions.EQUAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'EQUAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'EQUAL' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'EQUAL' operation.

  ## Returns

  The result of the 'EQUAL' operation.
  """
  def execute(game, code, trace) do
    Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["left"]) == Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["right"])
  end


end
    