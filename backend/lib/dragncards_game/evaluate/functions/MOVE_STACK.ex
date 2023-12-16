defmodule DragnCardsGame.Evaluate.Functions.MOVE_STACK do
  alias DragnCardsGame.{Evaluate, GameUI}
  @moduledoc """
  Handles the 'MOVE_STACK' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'MOVE_STACK' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'MOVE_STACK' operation.

  ## Returns

  The result of the 'MOVE_STACK' operation.
  """
  def execute(game, code, trace) do
    argc = Enum.count(code) - 1
    stack_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["stack_id"])
    dest_group_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["dest_group_id"])
    dest_stack_index = Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["dest_stack_index"])
    options = if argc >= 4 do Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["options"] ) else nil end
    #try do
      GameUI.move_stack(game, stack_id, dest_group_id, dest_stack_index, options)
    #rescue
    #  e ->
    #    raise("Failed to move stack #{stack_id} to dest_group_id:#{dest_group_id} dest_stack_index:#{dest_stack_index}. " <> inspect(e) <> inspect(trace))
    #end
  end


end
