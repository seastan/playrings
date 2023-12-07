defmodule DragnCardsGame.Evaluate.Functions.GET do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'GET' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'GET' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'GET' operation.

  ## Returns

  The result of the 'GET' operation.
  """
  def execute(game, code, trace) do
    path = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["path"])
    get_in(game, path)
  end


end
    