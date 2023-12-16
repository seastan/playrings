defmodule DragnCardsGame.Evaluate.Functions.LESS_THAN do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'LESS_THAN' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LESS_THAN' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'LESS_THAN' operation.

  ## Returns

  The result of the 'LESS_THAN' operation.
  """
  def execute(game, code, trace) do
    {lhs, rhs} = Evaluate.get_lhs_rhs(game, code, trace)
    lhs < rhs
  end


end
