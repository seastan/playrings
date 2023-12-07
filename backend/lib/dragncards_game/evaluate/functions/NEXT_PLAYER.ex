defmodule DragnCardsGame.Evaluate.Functions.NEXT_PLAYER do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'NEXT_PLAYER' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'NEXT_PLAYER' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'NEXT_PLAYER' operation.

  ## Returns

  The result of the 'NEXT_PLAYER' operation.
  """
  def execute(game, code, trace) do
    current_player_i = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["current_player_i"])
    current_i = String.to_integer(String.slice(current_player_i, -1..-1))
    next_i = current_i + 1
    next_i = if next_i > game["numPlayers"] do 1 else next_i end
    "player" <> Integer.to_string(next_i)
  end


end
    