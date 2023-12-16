defmodule DragnCardsGame.Evaluate.Functions.RANDOM_INT do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'RANDOM_INT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'RANDOM_INT' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'RANDOM_INT' operation.

  ## Returns

  The result of the 'RANDOM_INT' operation.
  """
  def execute(game, code, trace) do
    mn = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["min"])
    mx = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["max"])
    :rand.uniform(mx - mn + 1) + mn - 1
  end


end
    