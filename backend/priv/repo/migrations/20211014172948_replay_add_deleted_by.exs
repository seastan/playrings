defmodule DragnCards.Repo.Migrations.ReplayAddDeletedBy do
  use Ecto.Migration

  def change do
    alter table(:replays) do
      add(:deleted_by, {:array, :integer})
    end
  end
end
