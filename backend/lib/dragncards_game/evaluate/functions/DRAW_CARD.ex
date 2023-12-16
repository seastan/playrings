defmodule DragnCardsGame.Evaluate.Functions.DRAW_CARD do
  alias DragnCardsGame.{Evaluate, GameUI}
  @moduledoc """
  Handles the 'DRAW_CARD' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'DRAW_CARD' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'DRAW_CARD' operation.

  ## Returns

  The result of the 'DRAW_CARD' operation.
  """
  def execute(game, code, trace) do
    argc = Enum.count(code) - 1
    num = if argc == 0 do 1 else Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["num"]) end
    player_n = Evaluate.evaluate(game, "$PLAYER_N", trace ++ ["player_n"])
    GameUI.move_stacks(game, player_n <> "Deck", player_n <> "Hand", num, "bottom")
  end


end
