defmodule DragnCardsGame.Evaluate.Functions.FILTER_CARDS do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'FILTER_CARDS' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'FILTER_CARDS' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'FILTER_CARDS' operation.

  ## Returns

  The result of the 'FILTER_CARDS' operation.
  """
  def execute(game, code, trace) do
    var_name = Enum.at(code, 1)
    condition = Enum.at(code, 2)
    all_cards = Enum.filter(Map.values(game["cardById"]), fn(card) ->
      Evaluate.card_match?(game, var_name, card, condition, trace)
    end)
    all_cards
  end


end
