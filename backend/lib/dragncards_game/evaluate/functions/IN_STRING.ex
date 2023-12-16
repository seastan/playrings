defmodule DragnCardsGame.Evaluate.Functions.IN_STRING do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'IN_STRING' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'IN_STRING' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'IN_STRING' operation.

  ## Returns

  The result of the 'IN_STRING' operation.
  """
  def execute(game, code, trace) do
    container = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["container"])
    containee = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["containee"])
    if container == nil or containee == nil do
      false
    else
      String.contains?(container, containee)
    end
  end


end
    