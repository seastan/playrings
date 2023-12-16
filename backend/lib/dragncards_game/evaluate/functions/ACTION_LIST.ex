defmodule DragnCardsGame.Evaluate.Functions.ACTION_LIST do
  alias DragnCardsGame.Evaluate
  alias DragnCards.Plugins
  @moduledoc """
  Handles the 'ACTION_LIST' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ACTION_LIST' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'ACTION_LIST' operation.

  ## Returns

  The result of the 'ACTION_LIST' operation.
  """
  def execute(game, code, trace) do
     action_list_or_id = Enum.at(code, 1)

    # Set the load_list_id
    action_list = cond do
      is_list(action_list_or_id) ->
        action_list_or_id
      String.starts_with?(action_list_or_id, "$") ->
        Evaluate.evaluate_inner(game, action_list_or_id, trace ++ ["variable"])
      true ->
        action_list_id = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["action_list_id"])
        game_def = Plugins.get_game_def(game["options"]["pluginId"])
        game_def["actionLists"][action_list_id]
    end
    Evaluate.evaluate(game, action_list, trace)

  end


end
