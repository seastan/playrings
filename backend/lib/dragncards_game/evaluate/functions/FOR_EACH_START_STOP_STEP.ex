defmodule DragnCardsGame.Evaluate.Functions.FOR_EACH_START_STOP_STEP do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. var_name (string starting with $)
  2. start (number)
  3. stop (number)
  4. step (number)
  5. function (actionList)

  Iterates over the numbers from start to stop-1, incrementing by step each time. Assigns the current number to var_name.

  *Returns*:
  (any) The result of the successive calling of the function on each number.

  *Example*:
  ```
  [
    ["FOR_EACH_START_STOP_STEP", "$I", 0, 10, 1, [
      ["LOG", "{{$I}}"]
    ]
  ]
  ```
  ```
  [
    ["FOR_EACH_START_STOP_STEP", "$I", 1, 10, 2, [
      ["VAR", "$PLAYER_I", "player{{$I}}"],
      ["LOG", ["GET_ALIAS", "$PLAYER_I"], " is an odd numbered player."]
    ]
  ]
  ```
  """

  @doc """
  Executes the 'FOR_EACH_START_STOP_STEP' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'FOR_EACH_START_STOP_STEP' operation.

  ## Returns

  The result of the 'FOR_EACH_START_STOP_STEP' operation.
  """
  def execute(game, code, trace) do
    var_name = Enum.at(code, 1)
    start = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["start"])
    stop = Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["stop"])
    step = Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["step"])
    function = Enum.at(code, 5)
    Enum.reduce(start..stop-1//step, game, fn(i, acc) ->
      acc = Evaluate.evaluate(acc, ["VAR", var_name, i], trace ++ ["index #{i}"])
      Evaluate.evaluate(acc, function, trace ++ ["index #{i}"])
    end)
    # # Delete local variable
    # game
    # |> put_in(["variables"], Map.delete(game["variables"], "#{var_name}-#{current_scope_index}"))
  end


end
