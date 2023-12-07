defmodule DragnCardsGame.Evaluate.Functions.SHUFFLE_TOP_X do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'SHUFFLE_TOP_X' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SHUFFLE_TOP_X' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'SHUFFLE_TOP_X' operation.

  ## Returns

  The result of the 'SHUFFLE_TOP_X' operation.
  """
  def execute(game, code, trace) do
    group_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["group_id"])
    x = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["x"])
    stack_ids = game["groupById"][group_id]["stackIds"]
    stack_ids_l = Enum.slice(stack_ids, 0, x)
    stack_ids_r = Enum.slice(stack_ids, x, Enum.count(stack_ids))
    stack_ids_l = stack_ids_l |> Enum.shuffle
    put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)
  end


end
    