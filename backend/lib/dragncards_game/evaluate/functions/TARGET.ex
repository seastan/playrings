defmodule DragnCardsGame.Evaluate.Functions.TARGET do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'TARGET' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'TARGET' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'TARGET' operation.

  ## Returns

  The result of the 'TARGET' operation.
  """
  def execute(game, code, trace) do
    card_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
    Evaluate.evaluate(game, ["SET", "/cardById/" <> card_id <> "/targeting/$PLAYER_N", true], trace ++ ["set"])
  end


end
    