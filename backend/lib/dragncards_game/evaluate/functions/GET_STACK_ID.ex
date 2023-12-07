defmodule DragnCardsGame.Evaluate.Functions.GET_STACK_ID do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'GET_STACK_ID' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'GET_STACK_ID' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'GET_STACK_ID' operation.

  ## Returns

  The result of the 'GET_STACK_ID' operation.
  """
  def execute(game, code, trace) do
    group_id = Evaluate.evaluate(game, Enum.at(code,1), trace ++ ["group_id"])
    stack_index = Evaluate.evaluate(game, Enum.at(code,2), trace ++ ["stack_index"])
    if group_id do Evaluate.evaluate(game, ["AT_INDEX", "$GAME.groupById." <> group_id <> ".stackIds", stack_index], trace) else nil end
  end


end
    