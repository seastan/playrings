defmodule DragnCardsGame.Evaluate.Functions.FUNCTION do
  @moduledoc """
  Handles the 'FUNCTION' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'FUNCTION' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'FUNCTION' operation.

  ## Returns

  The result of the 'FUNCTION' operation.
  """
  def execute(game, code, _trace) do
    new_func_name = Enum.at(code, 1)
    # if func_name is not all caps, raise an error
    if String.upcase(new_func_name) == new_func_name do
      new_func_args = Enum.slice(code, 2, Enum.count(code) - 3)
      new_func_code = Enum.at(code, -1)
      put_in(game, ["functions", new_func_name], %{"args" => new_func_args, "code" => new_func_code})
    else
      raise "Tried to define function '#{new_func_name}' but it is not all caps."
    end
  end


end
