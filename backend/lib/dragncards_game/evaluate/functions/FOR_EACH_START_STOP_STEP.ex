defmodule DragnCardsGame.Evaluate.Functions.FOR_EACH_START_STOP_STEP do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'FOR_EACH_START_STOP_STEP' operation in the DragnCardsGame evaluation process.
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
