defmodule DragnCardsGame.Evaluate.Functions.ABORT do
  alias DragnCardsGame.{Evaluate}
  @moduledoc """
  Handles the 'ABORT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ABORT' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'ABORT' operation.

  ## Returns

  The result of the 'ABORT' operation.
  """
  def execute(game, code, trace) do
    statements = Enum.slice(code, 1, Enum.count(code))
    message = Evaluate.message_list_to_string(game, statements, trace ++ ["message_list_to_string"])
    raise "ABORT: #{message}"
  end

end
