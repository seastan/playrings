defmodule DragnCardsGame.Evaluate.Functions.ERROR do
  alias DragnCardsGame.Evaluate
  require Logger
  @moduledoc """
  Handles the 'ERROR' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'ERROR' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'ERROR' operation.

  ## Returns

  The result of the 'ERROR' operation.
  """
  def execute(game, code, trace) do
    Logger.error("in #{game["pluginName"]}#{Enum.at(code, 1)}")
    Evaluate.evaluate(game, ["LOG", Enum.at(code, 1)], trace)
  end


end
