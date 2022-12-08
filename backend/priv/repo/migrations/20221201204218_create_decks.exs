defmodule DragnCards.Repo.Migrations.CreateDecks do
  use Ecto.Migration

  def change do
    create table(:decks) do
      add :name, :string, null: false
      add :author_id, references(:users, on_delete: :nothing), null: false
      add :plugin_id, references(:plugins, on_delete: :nothing), null: false
      add :card_uuids, {:array, :string}, null: false
      add :quantities, {:array, :integer}, null: false
      add :load_group_ids, {:array, :string}, null: false

      timestamps()
    end

    create index(:decks, [:author_id])
    create index(:decks, [:plugin_id])
  end
end
