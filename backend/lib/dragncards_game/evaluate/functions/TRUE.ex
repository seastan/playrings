defmodule DragnCardsGame.Evaluate.Functions.TRUE do
  @moduledoc """
  Handles the 'TRUE' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'TRUE' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'TRUE' operation.

  ## Returns

  The result of the 'TRUE' operation.
  """
  def execute(_game, _code, _trace) do
    true
  end


end
