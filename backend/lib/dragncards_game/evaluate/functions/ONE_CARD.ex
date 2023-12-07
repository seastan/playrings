defmodule DragnCardsGame.Evaluate.Functions.ONE_CARD do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'ONE_CARD' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ONE_CARD' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'ONE_CARD' operation.

  ## Returns

  The result of the 'ONE_CARD' operation.
  """
  def execute(game, code, trace) do
    var_name = Enum.at(code, 1)
    condition = Enum.at(code, 2)
    one_card = Enum.find(Map.values(game["cardById"]), fn(card) ->
      Evaluate.card_match?(game, var_name, card, condition, trace)
    end)
    one_card
  end


end
