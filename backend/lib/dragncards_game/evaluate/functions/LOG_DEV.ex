defmodule DragnCardsGame.Evaluate.Functions.LOG_DEV do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'LOG_DEV' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LOG_DEV' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'LOG_DEV' operation.

  ## Returns

  The result of the 'LOG_DEV' operation.
  """
  def execute(game, code, trace) do
    current_scope_index = game["currentScopeIndex"]
    IO.puts("LOG_DEV #{current_scope_index}:")
    IO.inspect(Enum.at(code, 1))
    IO.inspect(Evaluate.evaluate(game, Enum.at(code, 1), trace))
    game
  end


end
