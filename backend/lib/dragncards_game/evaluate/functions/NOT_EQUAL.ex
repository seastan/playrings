defmodule DragnCardsGame.Evaluate.Functions.NOT_EQUAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'NOT_EQUAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'NOT_EQUAL' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'NOT_EQUAL' operation.

  ## Returns

  The result of the 'NOT_EQUAL' operation.
  """
  def execute(game, code, trace) do
    Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["left"]) != Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["right"])
  end


end
    