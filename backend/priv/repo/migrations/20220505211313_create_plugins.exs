defmodule DragnCards.Repo.Migrations.CreatePlugins do
  use Ecto.Migration

  def change do
    create table(:plugins) do
      add(:author_user_id, :integer, null: false)
      add(:author_alias, :string, null: false)
      add(:plugin_uuid, :string, null: false)
      add(:plugin_name, :string, null: false)
      add(:version, :integer, null: false)
      add(:game_def, :map, null: false)
      add(:card_db, :map, null: false)
      add(:num_favorites, :integer, null: false)
      add(:public, :boolean, null: false)
      timestamps()
    end
  end
end
