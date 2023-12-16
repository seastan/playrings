defmodule DragnCardsGame.Evaluate.Functions.OR do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'OR' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'OR' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'OR' operation.

  ## Returns

  The result of the 'OR' operation.
  """
  def execute(game, code, trace) do
    statements = Enum.slice(code, 1, Enum.count(code) - 1)
    Enum.any?(Enum.with_index(statements), fn {statement, index} ->
      Evaluate.evaluate(game, statement, trace ++ ["index #{index}"])
    end)
  end


end
    