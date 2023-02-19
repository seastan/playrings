defmodule DragnCardsGame.GameRegistry do
  @moduledoc """
  Keeps track of games.
  """
  require Logger
  alias DragnCardsGame.{GameUI, GameUIServer}
  alias DragnCards.Rooms
  alias DragnCards.Rooms.Room

  @doc """
  add/2
  Register a GameUI.  We will create a Room in the database
  so it can be found in the lobby.
  """
  def add(game_name, %{}= gameui) do
    remove(game_name)

    gameui
    |> to_room_param()
    |> Rooms.create_room()
  end

  @doc """
  update/2
  Update information about a GameUI.  We will update the Room
  row in the database so it can found in the lobby.
  """
  def update(game_name, %{} = gameui) do
    room = Rooms.get_room_by_name(game_name)

    case room do
      %Room{} -> Rooms.update_room(room, to_room_param(gameui))
      _ -> nil
    end
  end

  @doc """
  remove/1
  Remove a GameUI.  We will delete the Room in the database.
  """
  def remove(game_name) do
    room = Rooms.get_room_by_name(game_name)

    case room do
      %Room{} -> Rooms.delete_room(room)
      _ -> nil
    end
  end

  # Convert a GameUI{} into a %{} that is suitable for
  # inserting or updating a Room.
  defp to_room_param(%{} = gameui) do
    encounter_name = gameui["game"]["encounterName"]
    encounter_name = if encounter_name == nil || encounter_name == "" do
      "Unspecified"
    else
      encounter_name
    end
    %{
      name: gameui["gameName"],
      created_by: gameui["created_by"],
      privacy_type: gameui["privacyType"],
      last_update: gameui["lastUpdate"],
      encounter_name: encounter_name,
      num_players: gameui["game"]["numPlayers"],
    }
  end

  @doc """
  cleanup/0
  Find all Rooms in the database that don't currently have
  GameUIServers running for them, and delete them!
  Usually, GameUIServers run remove/1 when they terminate,
  but sometimes the server dies for other reasons.
  """
  def cleanup() do
    Rooms.list_rooms()
    |> Enum.filter(fn room -> not GameUIServer.game_exists?(room.name) end)
    |> Enum.each(fn room ->
      Rooms.delete_room(room)
    end)
  end
end
