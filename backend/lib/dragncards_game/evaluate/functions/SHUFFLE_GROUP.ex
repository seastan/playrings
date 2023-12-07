defmodule DragnCardsGame.Evaluate.Functions.SHUFFLE_GROUP do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'SHUFFLE_GROUP' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SHUFFLE_GROUP' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'SHUFFLE_GROUP' operation.

  ## Returns

  The result of the 'SHUFFLE_GROUP' operation.
  """
  def execute(game, code, trace) do
    group_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["group_id"])
    stack_ids = game["groupById"][group_id]["stackIds"]
    shuffled_stack_ids = stack_ids |> Enum.shuffle
    put_in(game, ["groupById", group_id, "stackIds"], shuffled_stack_ids)
  end


end
    