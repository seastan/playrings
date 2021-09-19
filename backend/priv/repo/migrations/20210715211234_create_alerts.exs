defmodule DragnCards.Repo.Migrations.CreateAlerts do
  use Ecto.Migration

  def change do
    create table(:alerts) do
      add(:message, :string)

      timestamps()
    end
  end
end
