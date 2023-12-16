defmodule DragnCardsGame.Evaluate.Functions.LESS_EQUAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'LESS_EQUAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LESS_EQUAL' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'LESS_EQUAL' operation.

  ## Returns

  The result of the 'LESS_EQUAL' operation.
  """
  def execute(game, code, trace) do
    {lhs, rhs} = Evaluate.get_lhs_rhs(game, code, trace)
    lhs <= rhs
  end


end
