defmodule Spades.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    # List all child processes to be supervised
    children = [
      # MNesia for Pow - will need reworking in prod
      Pow.Store.Backend.MnesiaCache,
      # Start the Ecto repository
      Spades.Repo,
      # Start the endpoint when the application starts
      SpadesWeb.Endpoint,
      # GameUISupervisor and Process Registry
      {Registry, keys: :unique, name: SpadesGame.GameUIRegistry},
      SpadesGame.GameUISupervisor,
      # ChatSupervisor and Process Registry
      {Registry, keys: :unique, name: SpadesChat.ChatRegistry},
      SpadesChat.ChatSupervisor,
      # Room Cleanup
      {Periodic,
       run: &SpadesGame.GameRegistry.cleanup/0,
       initial_delay: :timer.seconds(1),
       every: :timer.minutes(5)}
      # Starts a worker by calling: Spades.Worker.start_link(arg)
      # {Spades.Worker, arg},
    ]

    :ets.new(:game_uis, [:public, :named_table])

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Spades.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    SpadesWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
