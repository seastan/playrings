defmodule DragnCardsGame.Evaluate.Functions.DELETE_CARD do
  alias DragnCardsGame.{Evaluate, GameUI}
  @moduledoc """
  Handles the 'DELETE_CARD' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'DELETE_CARD' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'DELETE_CARD' operation.

  ## Returns

  The result of the 'DELETE_CARD' operation.
  """
  def execute(game, code, trace) do
    card_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
    try do
      GameUI.delete_card(game, card_id)
    rescue
      e ->
        raise("Failed to delete card #{card_id}. " <> inspect(e) <> inspect(trace))
    end
  end


end
