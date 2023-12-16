defmodule DragnCardsGame.Evaluate.Functions.OBJ_GET_VAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'OBJ_GET_VAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'OBJ_GET_VAL' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'OBJ_GET_VAL' operation.

  ## Returns

  The result of the 'OBJ_GET_VAL' operation.
  """
  def execute(game, code, trace) do
    map = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["map"])
    key = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["key"])
    map[key]
  end


end
    