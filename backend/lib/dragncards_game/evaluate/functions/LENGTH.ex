defmodule DragnCardsGame.Evaluate.Functions.LENGTH do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'LENGTH' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'LENGTH' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'LENGTH' operation.

  ## Returns

  The result of the 'LENGTH' operation.
  """
  def execute(game, code, trace) do
    value = Evaluate.evaluate(game, Enum.at(code, 1), trace)
    if is_binary(value) do String.length(value) else Enum.count(value) end
  end


end
    