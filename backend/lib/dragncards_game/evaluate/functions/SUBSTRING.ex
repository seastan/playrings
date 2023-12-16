defmodule DragnCardsGame.Evaluate.Functions.SUBSTRING do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'SUBSTRING' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SUBSTRING' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'SUBSTRING' operation.

  ## Returns

  The result of the 'SUBSTRING' operation.
  """
  def execute(game, code, trace) do
    string = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["string"])
    start = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["start"])
    length = Evaluate.evaluate(game, Enum.at(code,3), trace ++ ["length"])
    String.slice(string, start..start+length-1)
  end


end
    