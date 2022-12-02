defmodule DragnCards.Repo.Migrations.CreateLoadListItems do
  use Ecto.Migration

  def change do
    create table(:load_list_items) do
      add :quantity, :integer, null: false
      add :load_group_id, :string, null: false
      add :deck_id, references(:decks, on_delete: :nothing), null: false

      timestamps()
    end

    create index(:load_list_items, [:deck_id])
  end
end
