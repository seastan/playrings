defmodule DragnCardsGame.Evaluate.Functions.AND do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'AND' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'AND' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'AND' operation.

  ## Returns

  The result of the 'AND' operation.
  """
  def execute(game, code, trace) do
    statements = Enum.slice(code, 1, Enum.count(code) - 1)
    Enum.all?(Enum.with_index(statements), fn {statement, index} ->
      Evaluate.evaluate(game, statement, trace ++ ["index #{index}"])
    end)
  end


end
    