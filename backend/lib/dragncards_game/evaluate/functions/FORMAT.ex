defmodule DragnCardsGame.Evaluate.Functions.FORMAT do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. `formatString` (string)
  2. Any number of arguments

  Returns a formatted string using `formatString` and additional arguments converted using the `INSPECT` operation.

  Placeholders to insert additional arguments are in the `{index}` format, for example `{0}`. Hint for the `INSPECT` operation can be provided after a colon, for example `{0:A}`.

  `formatString` can be a label itself, for example `id:messageA`. Multiple labels inside `formatString` are not supported.

  *Returns*:
  (string) The result of the operation.
  """

  @doc """
  Executes the 'FORMAT' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'FORMAT' operation.

  ## Returns

  The result of the 'FORMAT' operation.
  """
  def execute(game, code, trace) do
    formatString = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["formatString"])
    if !is_binary(formatString) do
      raise "FORMAT: formatString must be a string"
    end
    formatStringResolved =
      if String.starts_with?(formatString, "id:") do
        labelId = String.replace_leading(formatString, "id:", "")
        label = Evaluate.evaluate(game, "$GAME_DEF.labels.#{labelId}.{{$GAME.options.language}}", trace ++ ["label"])
        if is_binary(label) do
          label
        else
          formatString
        end
    else
      formatString
    end
    list = Enum.slice(code, 2, Enum.count(code))
    nlist = Regex.scan(~r/{(?<idx>[0-9]+)(:(?<hint>[A-Za-z0-9_-]+))?}/, formatStringResolved, capture: :all_names)
    Enum.reduce(Enum.uniq(nlist), formatStringResolved, fn item, acc ->
      idx = String.to_integer(Enum.at(item, 1))
      hint = Enum.at(item, 0)
      cond do
        hint !== "" -> String.replace(acc, "{#{idx}:#{hint}}", DragnCardsGame.Evaluate.Functions.INSPECT.to_string(game, Enum.at(list, idx), hint, trace ++ ["idx #{idx}"]))
        true -> String.replace(acc, "{#{idx}}", DragnCardsGame.Evaluate.Functions.INSPECT.to_string(game, Enum.at(list, idx), "currentSide", trace ++ ["idx #{idx}"]))
      end
    end)
  end


end
