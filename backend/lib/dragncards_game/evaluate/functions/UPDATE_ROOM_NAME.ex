defmodule DragnCardsGame.Evaluate.Functions.UPDATE_ROOM_NAME do
  alias DragnCardsGame.Evaluate
  @moduledoc """
  *Arguments*:
  1. `name` (string)

  Updates the name of the room with the given name.

  *Returns*:
  (game state) The updated game state.
  """

  @doc """
  Executes the 'UPDATE_ROOM_NAME' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'UPDATE_ROOM_NAME' operation.

  ## Returns

  The result of the 'UPDATE_ROOM_NAME' operation.
  """
  def execute(game, code, trace) do
    name = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["name"])
    Rooms.update_room_name_by_slug(game["roomSlug"], name)
    Evaluate.evaluate(game, ["SET", "/roomName", name], trace)
  end


end
