defmodule SpadesGame.GameUISupervisor do
  @moduledoc """
  A supervisor that starts `GameUIServer` processes dynamically.
  """

  use DynamicSupervisor

  alias SpadesGame.{GameUIServer, GameOptions}

  def start_link(_arg) do
    DynamicSupervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  @doc """
  Starts a `GameUIServer` process and supervises it.
  """
  def start_game(game_name, %GameOptions{} = options) do
    child_spec = %{
      id: GameUIServer,
      start: {GameUIServer, :start_link, [game_name, options]},
      restart: :transient
    }
    IO.puts("gameuisup: start a")
    DynamicSupervisor.start_child(__MODULE__, child_spec)
    IO.puts("gameuisup: start b")
  end

  @doc """
  Terminates the `GameUIServer` process normally. It won't be restarted.
  """
  def stop_game(game_name) do
    # :ets.delete(:games, game_name)

    child_pid = GameUIServer.gameui_pid(game_name)
    DynamicSupervisor.terminate_child(__MODULE__, child_pid)
  end
end
