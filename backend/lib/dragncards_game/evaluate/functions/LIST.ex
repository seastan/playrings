defmodule DragnCardsGame.Evaluate.Functions.LIST do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'LIST' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LIST' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'LIST' operation.

  ## Returns

  The result of the 'LIST' operation.
  """
  def execute(game, code, trace) do
    list = Enum.slice(code, 1, Enum.count(code))
    Enum.reduce(Enum.with_index(list), [], fn({item, index}, acc)->
      acc ++ [Evaluate.evaluate(game, item, trace ++ ["index #{index}"])]
    end)
  end


end
    