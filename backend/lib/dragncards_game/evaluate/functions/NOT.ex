defmodule DragnCardsGame.Evaluate.Functions.NOT do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'NOT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'NOT' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'NOT' operation.

  ## Returns

  The result of the 'NOT' operation.
  """
  def execute(game, code, trace) do
    !Evaluate.evaluate(game, Enum.at(code,1), trace)
  end


end
    