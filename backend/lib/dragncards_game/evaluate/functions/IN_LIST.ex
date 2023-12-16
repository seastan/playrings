defmodule DragnCardsGame.Evaluate.Functions.IN_LIST do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'IN_LIST' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'IN_LIST' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'IN_LIST' operation.

  ## Returns

  The result of the 'IN_LIST' operation.
  """
  def execute(game, code, trace) do
    list = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["list"]) || []
    Enum.member?(list, Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["member"]))
  end


end
    