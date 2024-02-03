defmodule DragnCardsGame.Evaluate.Functions.LOOK_AT do
  alias DragnCardsGame.{Evaluate}
  @moduledoc """
  Handles the 'LOOK_AT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LOOK_AT' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'LOOK_AT' operation.

  ## Returns

  The result of the 'LOOK_AT' operation.
  """
  def execute(game, code, trace) do
    player_i = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["player_i"])
    group_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["group_id"])
    top_n = Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["top_n"])
    visibility = Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["visibility"])
    stack_ids = Evaluate.evaluate(game, "$GAME.groupById.#{group_id}.stackIds", trace ++ ["stack_ids"])
    top_n = if top_n == -1 do
      Enum.count(stack_ids)
    else
      top_n
    end
    action_list = [
      ["SET", "/playerData/#{player_i}/browseGroup/id", group_id],
      ["SET", "/playerData/#{player_i}/browseGroup/topN", top_n],
      ["FOR_EACH_START_STOP_STEP", "$i", 0, top_n, 1,
        [
          ["VAR", "$CARD_ID", "$GAME.groupById.#{group_id}.parentCardIds.[$i]"],
          ["SET", "/cardById/$CARD_ID/peeking/#{player_i}", visibility]
        ]
      ]
    ];
    Evaluate.evaluate(game, action_list, trace ++ ["action_list"])
  end

end
