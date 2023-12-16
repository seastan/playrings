defmodule DragnCardsGame.Evaluate.Functions.PREV do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'PREV' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'PREV' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'PREV' operation.

  ## Returns

  The result of the 'PREV' operation.
  """
  def execute(game, code, trace) do
    prev_game = game["prev_game"]
    |> Map.put("variables", game["variables"])
    |> put_in(["variables", "$TARGET"], game["prev_game"]["variables"]["$TARGET"])
    |> put_in(["variables", "$TARGET_ID"], game["prev_game"]["variables"]["$TARGET_ID"])
    |> put_in(["variables", "$THIS"], game["prev_game"]["variables"]["$THIS"])
    |> put_in(["variables", "$THIS_ID"], game["prev_game"]["variables"]["$THIS_ID"])
    Evaluate.evaluate(prev_game, Enum.at(code, 1), trace)
  end


end
    