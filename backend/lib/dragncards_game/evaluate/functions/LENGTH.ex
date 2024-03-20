defmodule DragnCardsGame.Evaluate.Functions.LENGTH do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. string_or_list (string | list)

  *Returns*:
  (number) The length of the string or list.

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
