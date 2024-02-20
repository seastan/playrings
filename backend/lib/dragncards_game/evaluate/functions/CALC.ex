defmodule DragnCardsGame.Evaluate.Functions.CALC do
  alias DragnCardsGame.Evaluate
  alias DragnCardsUtil.StringMath
  @moduledoc """
  Handles the 'CALC' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'CALC' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'CALC' operation.

  ## Returns

  The result of the 'CALC' operation.
  """
  def execute(game, code, trace) do
    string = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["pre-parse"]) # Parse the string for {{}}
    StringMath.evaluate_string(string)
  end


end
