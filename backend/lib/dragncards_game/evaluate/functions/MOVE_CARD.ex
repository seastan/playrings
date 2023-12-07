defmodule DragnCardsGame.Evaluate.Functions.MOVE_CARD do
  alias DragnCardsGame.{Evaluate, GameUI}
  @moduledoc """
  Handles the 'MOVE_CARD' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'MOVE_CARD' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'MOVE_CARD' operation.

  ## Returns

  The result of the 'MOVE_CARD' operation.
  """
  def execute(game, code, trace) do
    argc = Enum.count(code) - 1
    card_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
    if card_id do
      dest_group_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["dest_group_id"])
      dest_stack_index = Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["dest_stack_index"])
      dest_card_index = if argc >= 4 do Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["dest_stack_index"]) else 0 end
      options = if argc >= 5 do Evaluate.evaluate(game, Enum.at(code, 5), trace ++ ["options"]) else nil end
      GameUI.move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, options)

    else
      game
    end
  end


end
