defmodule DragnCards.Repo.Migrations.ReplayAddOutcome do
  use Ecto.Migration

  def change do
    alter table(:replays) do
      add(:outcome, :string)
    end
  end
end
