defmodule DragnCardsGame.Evaluate.Functions.INCREASE_VAR do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  Handles the 'INCREASE_VAR' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'INCREASE_VAR' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'INCREASE_VAR' operation.

  ## Returns

  The result of the 'INCREASE_VAR' operation.
  """
  def execute(game, code, trace) do
    # Evaluate the value and assign it to the var name
    var_name = Enum.at(code, 1)
    # if var_name does not start with $, raise an error
    if String.starts_with?(var_name, "$") do
      current_scope_index = game["currentScopeIndex"]
      var_scope_index = Evaluate.find_var_scope_index(var_name, current_scope_index, game["variables"])
      current_value = game["variables"]["#{var_scope_index}"][var_name] || 0
      delta = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ [var_name]) || 0
      put_in(game, ["variables", "#{var_scope_index}", var_name], current_value + delta)
    else
      raise "Tried to update variable '#{var_name}' but it does not start with $."
    end
  end


end
