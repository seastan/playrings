defmodule DragnCards.Repo do
  use Ecto.Repo,
    otp_app: :dragncards,
    adapter: Ecto.Adapters.SQLite3
end
