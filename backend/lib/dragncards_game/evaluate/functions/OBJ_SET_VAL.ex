defmodule DragnCardsGame.Evaluate.Functions.OBJ_SET_VAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'OBJ_SET_VAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'OBJ_SET_VAL' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'OBJ_SET_VAL' operation.

  ## Returns

  The result of the 'OBJ_SET_VAL' operation.
  """
  def execute(game, code, trace) do
    case Enum.count(code) do
      4 ->
        obj = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["obj"])
        key = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["key"])
        value = Evaluate.evaluate(game, Enum.at(code,3), trace ++ ["value"])
        put_in(obj[key], value)
      5 ->
        obj = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["obj"])
        path = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["path"])
        key = Evaluate.evaluate(game, Enum.at(code,3), trace ++ ["key"])
        value = Evaluate.evaluate(game, Enum.at(code,4), trace ++ ["value"])
        put_in(obj, path ++ [key], value)
    end
  end


end
    