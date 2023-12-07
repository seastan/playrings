defmodule DragnCardsGame.Evaluate.Functions.COND do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'COND' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'COND' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'COND' operation.

  ## Returns

  The result of the 'COND' operation.
  """
  def execute(game, code, trace) do
    ifthens = Enum.slice(code, 1, Enum.count(code))
    Enum.reduce_while(0..Enum.count(ifthens)-1//2, game, fn(i, _acc) ->
      if Evaluate.evaluate(game, Enum.at(ifthens, i), trace ++ ["index #{i} (if)"]) == true do
        {:halt, Evaluate.evaluate(game, Enum.at(ifthens, i+1), trace ++ ["index #{i} (then)"])}
      else
        {:cont, game}
      end
    end)
  end


end
    