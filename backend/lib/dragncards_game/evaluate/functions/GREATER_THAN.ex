defmodule DragnCardsGame.Evaluate.Functions.GREATER_THAN do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'GREATER_THAN' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'GREATER_THAN' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'GREATER_THAN' operation.

  ## Returns

  The result of the 'GREATER_THAN' operation.
  """
  def execute(game, code, trace) do
    {lhs, rhs} = Evaluate.get_lhs_rhs(game, code, trace)
    lhs > rhs
  end


end
