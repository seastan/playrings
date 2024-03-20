defmodule DragnCardsGame.Evaluate.Functions.FOR_EACH_KEY_VAL do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. key_name (string starting with $)
  2. val_name (string starting with $)
  3. obj (object)
  4. function (actionList)
  5. sort_prop (string) (optional)
  6. sort_order (string) (optional)

  Iterates over the key-value pairs of an object, assigning the key to key_name and the value to val_name.

  If sort_prop is provided, the list will be sorted by that property before iteration.

  If sort_order is provided, it will be used to determine the sort order ("ASC" or "DESC").

  *Returns*:
  (any) The result of the successive calling of the function on each key-value pair.

  *Example*:
  ```
  [
    ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$GAME.cardById, [
      ["LOG", "{{$CARD_ID}}: {{$CARD.currentFace.name}}"]
    ]
  ]
  ```
  [
    ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$GAME.cardById, [
      ["COND",
        ["EQUAL", ["VAR", "$CARD.rotation"], 90],
        [
          ["LOG", "{{$ALIAS_N}} readied {{$CARD.currentFace.name}}."],
          ["SET", "/cardById/{{$CARD_ID}}/rotation", 0]
        ]
      ]
    ]
  ]
  ```

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
