defmodule DragnCardsGame.Evaluate.Functions.SHUFFLE_LIST do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'SHUFFLE_LIST' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'SHUFFLE_LIST' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'SHUFFLE_LIST' operation.

  ## Returns

  The result of the 'SHUFFLE_LIST' operation.
  """
  def execute(game, code, trace) do
    Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["arg0"]) |> Enum.shuffle
  end


end
