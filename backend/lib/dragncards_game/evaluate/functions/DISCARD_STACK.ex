defmodule DragnCardsGame.Evaluate.Functions.DISCARD_STACK do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'DISCARD_STACK' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'DISCARD_STACK' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'DISCARD_STACK' operation.

  ## Returns

  The result of the 'DISCARD_STACK' operation.
  """
  def execute(game, code, trace) do
    stack_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["DISCARD_STACK stack_id"])
    stack = game["stackById"][stack_id]
    card_ids = stack["cardIds"]

    Enum.reduce(card_ids, game, fn(card_id, acc) ->
      Evaluate.evaluate(acc, ["DISCARD_CARD", card_id], trace)
    end)
  end


end
    