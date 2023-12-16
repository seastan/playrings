defmodule DragnCardsGame.Evaluate.Functions.WHILE do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'WHILE' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'WHILE' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'WHILE' operation.

  ## Returns

  The result of the 'WHILE' operation.
  """
  def execute(game, code, trace) do
    condition = Enum.at(code, 1)
    action_list = Enum.at(code, 2)
    Evaluate.while_loop(game, condition, action_list, trace, 0)
  end


end
