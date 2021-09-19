defmodule DragnCards.Repo.Migrations.AlertAddMinutesUntil do
  use Ecto.Migration

  def change do
    alter table("alerts") do
      add(:minutes_until, :integer)
    end
  end
end
