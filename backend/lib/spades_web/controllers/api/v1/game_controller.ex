defmodule SpadesWeb.API.V1.GameController do
  use SpadesWeb, :controller

  require Logger

  alias Spades.Rooms
  alias Spades.Rooms.Room
  alias SpadesUtil.{NameGenerator}
  alias SpadesGame.{GameOptions, GameUISupervisor}

  def create(conn, _params) do
    game_name = NameGenerator.generate()
    options = %GameOptions{}
    #IO.puts(game_name)
    GameUISupervisor.start_game(game_name, options)
    room = Rooms.get_room_by_name(game_name)
    #IO.puts("ROOM")
    #IO.inspect(room)
    # with {:ok, _pid} <- GameUISupervisor.start_game(game_name, options),
    #      %Room{} = room <- Rooms.get_room_by_name(game_name) do
    if room do
      #IO.puts("game ok")
      conn
      |> put_status(:created)
      |> json(%{success: %{message: "Created game", room: room}})

    else
      #IO.puts("game not ok")
      conn
      |> put_status(500)
      |> json(%{error: %{status: 500, message: "Unable to create game"}})
    end
    #IO.inspect(game_name)
    #IO.inspect(conn)
  end
end
