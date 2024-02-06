defmodule DragnCardsGame.Evaluate.Functions.ABILITY do
  alias DragnCardsGame.{Evaluate}
  @moduledoc """
  Handles the 'ABILITY' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ABILITY' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'ABILITY' operation.

  ## Returns

  The result of the 'ABILITY' operation.
  """
  def execute(game, code, trace) do
    card_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["list"])
    card = get_in(game, ["cardById", card_id])
    side = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["list"])
    Evaluate.evaluate(game, [
      ["VAR", "$THIS_ID", card_id],
      ["VAR", "$THIS", card],
      ["ACTION_LIST", "$GAME.cardById.#{card_id}.sides.#{side}.ability"]
    ], trace ++ ["ability"])
  end

end
