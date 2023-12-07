defmodule DragnCardsGame.Evaluate.Functions.SET do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'SET' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SET' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'SET' operation.

  ## Returns

  The result of the 'SET' operation.
  """
  def execute(game, code, trace) do
    path = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["path"])
    value = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["value"])
    Evaluate.put_by_path(game, path, value, trace ++ ["put_by_path"])
  end


end
    