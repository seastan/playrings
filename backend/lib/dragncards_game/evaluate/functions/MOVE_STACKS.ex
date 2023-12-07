defmodule DragnCardsGame.Evaluate.Functions.MOVE_STACKS do
  alias DragnCardsGame.{Evaluate, GameUI}
  @moduledoc """
  Handles the 'MOVE_STACKS' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'MOVE_STACKS' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'MOVE_STACKS' operation.

  ## Returns

  The result of the 'MOVE_STACKS' operation.
  """
  def execute(game, code, trace) do
    argc = Enum.count(code) - 1
    orig_group_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["orig_group_id"])
    dest_group_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["dest_group_id"])
    top_n = if argc >= 3 do Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["top_n"]) else length(game["groupById"][orig_group_id]["stackIds"]) end
    position = if argc >= 4 do Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["position"]) else "shuffle" end
    options = if argc >= 5 do Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["options"] ) else nil end
    GameUI.move_stacks(game, orig_group_id, dest_group_id, top_n, position, options)
  end


end
