defmodule DragnCardsGame.Evaluate.Functions.AT_INDEX do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'AT_INDEX' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'AT_INDEX' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'AT_INDEX' operation.

  ## Returns

  The result of the 'AT_INDEX' operation.
  """
  def execute(game, code, trace) do
    list = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["list"])
    index = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["index"])
    if list do Enum.at(list, index) else nil end
  end


end
    