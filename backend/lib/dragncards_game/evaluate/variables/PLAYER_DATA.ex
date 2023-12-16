defmodule DragnCardsGame.Evaluate.Variables.PLAYER_DATA do
  @moduledoc """
  Returns the playerData object.
  """

  def execute(game, _trace) do
    game["playerData"]
  end
end
