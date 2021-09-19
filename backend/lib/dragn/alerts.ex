defmodule DragnCards.Alerts do
  @moduledoc """
  The Alerts context.
  """

  import Ecto.Query, warn: false
  alias DragnCards.Repo

  alias DragnCards.Alerts.Alert

  def get_alert() do
    query = Ecto.Query.from(a in Alert,
      order_by: [desc: a.inserted_at],
      limit: 1,
      select: %{
        :message => a.message,
        :inserted_at => a.inserted_at,
        :minutes_until => a.minutes_until
      })
    Repo.one(query)
  end
end
