defmodule DragnCardsGame.Evaluate.Functions.FOR_EACH_KEY_VAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'FOR_EACH_KEY_VAL' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'FOR_EACH_KEY_VAL' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'FOR_EACH_KEY_VAL' operation.

  ## Returns

  The result of the 'FOR_EACH_KEY_VAL' operation.
  """
  def execute(game, code, trace) do
    argc = Enum.count(code) - 1
    key_name = Enum.at(code, 1)
    val_name = Enum.at(code, 2)
    old_list = Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["old_list"])
    function = Enum.at(code, 4)
    old_list = if argc >= 5 do
      order = if argc >= 6 and Evaluate.evaluate(game, Enum.at(code, 6), trace ++ ["sort order"]) == "DESC" do :desc else :asc end
      Enum.sort_by(old_list, fn({_key, obj}) -> get_in(obj, Evaluate.evaluate(game, Enum.at(code, 5), trace ++ ["sort prop"])) end, order)
    else
      old_list
    end
    Enum.reduce(old_list, game, fn({key, val}, acc) ->
      acc = Evaluate.evaluate(acc, ["VAR", key_name, key], trace ++ ["key #{key}"])
      acc = Evaluate.evaluate(acc, ["VAR", val_name, val], trace ++ ["val"])
      Evaluate.evaluate(acc, function, trace ++ ["key #{key}"])
    end)
    # # Delete local variables
    # game
    # |> put_in(["variables"], Map.delete(game["variables"], "#{key_name}-#{current_scope_index}"))
    # |> put_in(["variables"], Map.delete(game["variables"], "#{val_name}-#{current_scope_index}"))

  end


end
