defmodule DragnCardsGame.Evaluate.Functions.PROCESS_MAP do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'PROCESS_MAP' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'PROCESS_MAP' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'PROCESS_MAP' operation.

  ## Returns

  The result of the 'PROCESS_MAP' operation.
  """
  def execute(game, code, trace) do
    Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["map"])
    |> Enum.reduce(%{}, fn({k, v}, acc) ->
      k = Evaluate.evaluate(game, k, trace ++ ["key"])
      v = Evaluate.evaluate(game, v, trace ++ ["value"])
      put_in(acc, [k], v)
    end)
  end


end
    