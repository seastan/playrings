defmodule DragnCardsGame.Evaluate.Functions.LOG do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'LOG' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LOG' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'LOG' operation.

  ## Returns

  The result of the 'LOG' operation.
  """
  def execute(game, code, trace) do
    statements = Enum.slice(code, 1, Enum.count(code))
    message = Evaluate.message_list_to_string(game, statements, trace ++ ["message_list_to_string"])
    put_in(game["messages"], game["messages"] ++ [message])
  end


end
