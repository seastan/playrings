defmodule DragnCardsGame.Evaluate.Functions.FACEUP_NAME_FROM_STACK_ID do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. stack_id (string)

  Gets the name of the faceup side of the card on the top of the stack with stack_id.

  *Returns*:
  (string) The name of the faceup side of the card on the top of the stack with stack_id.
  """

  @doc """
  Executes the 'FACEUP_NAME_FROM_STACK_ID' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'FACEUP_NAME_FROM_STACK_ID' operation.

  ## Returns

  The result of the 'FACEUP_NAME_FROM_STACK_ID' operation.
  """
  def execute(game, code, trace) do
    stack_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["stack_id"])
    card_id = Enum.at(game["stackById"][stack_id]["cardIds"],0)
    Evaluate.evaluate(game, ["FACEUP_NAME_FROM_CARD_ID", card_id], trace)
  end


end
