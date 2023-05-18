defmodule DragnCardsGame.PlayerData do
  @moduledoc """
  Represents a player.
  """
  alias DragnCardsGame.{PlayerData}

  @type t :: Map.t()

  @doc """
  new/1:  Create a player.
  """
  @spec new(Map.t()) :: PlayerData.t()
  def new(game_def) do
    base = %{
      "drawingArrowFrom" => nil,
    }
    # Add custom properties
    player_data = Enum.reduce(game_def["playerProperties"], base, fn({key,val}, acc) ->
      put_in(acc[key], val["default"])
    end)
  end

end
