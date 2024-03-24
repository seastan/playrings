defmodule DragnCardsGame.Evaluate.Functions.LOG do
  alias DragnCardsGame.Evaluate
  alias DragnCardsChat.{ChatMessage}
  @moduledoc """
  *Arguments*:
  Any number of string arguments


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
    # Get unix ms timestamp
    timestamp = System.system_time(:millisecond)
    # Create a new chat message
    message = ChatMessage.new(message, -1)
    game = put_in(game, ["messageByTimestamp", timestamp], message)
    put_in(game["messages"], game["messages"] ++ [message])
  end


end
