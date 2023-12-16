defmodule DragnCardsGame.Evaluate.Functions.DEFINED do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'DEFINED' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'DEFINED' operation with the given arguments.

  ## Parameters 

    - `args`: The arguments required for the 'DEFINED' operation.

  ## Returns

  The result of the 'DEFINED' operation.
  """
  def execute(game, code, trace) do
    var_name = Enum.at(code, 1)
    try do
      result = Evaluate.evaluate_inner(game, var_name, trace ++ ["#{var_name}"])
      result != nil
    rescue
      _ -> false
    end
  end


end
    