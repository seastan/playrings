defmodule DragnCardsGame.Evaluate.Functions.ATTACH_CARD do
  alias DragnCardsGame.{Evaluate, GameUI}
  @moduledoc """
  Handles the 'ATTACH_CARD' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ATTACH_CARD' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'ATTACH_CARD' operation.

  ## Returns

  The result of the 'ATTACH_CARD' operation.
  """
  def execute(game, code, trace) do
    card_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
    dest_card_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["dest_card_id"])
    dest_card = game["cardById"][dest_card_id]
    try do
      GameUI.move_card(game, card_id, dest_card["groupId"], dest_card["stackIndex"], -1, %{"combine" => true})
    rescue
      _ ->
        raise("Failed to attach card_id: #{inspect(card_id)} to dest_card_id: #{inspect(dest_card_id)}. ")
    end
  end


end
