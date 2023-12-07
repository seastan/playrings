defmodule DragnCardsGame.Evaluate.Variables.ALIAS_N do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Returns the alias of the player corresponding to `$PLAYER_N`.
  """

  def execute(game, trace) do
    player_n = Evaluate.evaluate(game, "$PLAYER_N", trace ++ ["$ALIAS_N"])
    get_in(game, ["playerInfo", player_n, "alias"])
  end
end
