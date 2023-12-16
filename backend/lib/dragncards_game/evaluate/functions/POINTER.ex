defmodule DragnCardsGame.Evaluate.Functions.POINTER do
  @moduledoc """
  Handles the 'POINTER' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'POINTER' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'POINTER' operation.

  ## Returns

  The result of the 'POINTER' operation.
  """
  def execute(_game, code, _trace) do
    Enum.at(code, 1)
  end


end
