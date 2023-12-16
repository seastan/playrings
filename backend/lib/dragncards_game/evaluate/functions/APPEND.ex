defmodule DragnCardsGame.Evaluate.Functions.APPEND do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'APPEND' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'APPEND' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'APPEND' operation.

  ## Returns

  The result of the 'APPEND' operation.
  """
  def execute(game, code, trace) do
    list = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["left"]) || []
    list ++ [Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["right"])]
  end


end
    