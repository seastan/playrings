defmodule DragnCardsGame.Evaluate.Functions.GET_CARD_ID do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'GET_CARD_ID' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'GET_CARD_ID' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'GET_CARD_ID' operation.

  ## Returns

  The result of the 'GET_CARD_ID' operation.
  """
  def execute(game, code, trace) do
    group_id = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["group_id"])
    stack_index = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["stack_index"])
    stack_id = Evaluate.evaluate(game, ["GET_STACK_ID", group_id, stack_index], trace ++ ["stack_id"])
    card_index = Evaluate.evaluate(game, Enum.at(code,3), trace ++ ["card_index"])
    if stack_id do Evaluate.evaluate(game, ["AT_INDEX", "$GAME.stackById." <> stack_id <> ".cardIds", card_index], trace) else nil end
  end


end
    