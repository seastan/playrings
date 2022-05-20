defmodule DragnCards.Repo.Migrations.CreatePlugins do
  use Ecto.Migration

  def change do
    create table(:plugins) do
      add(:user_id, :integer, null: false)
      add(:plugin_uuid, :string, null: false)
      add(:plugin_name, :string, null: false)
      add(:version, :integer, null: false, unique: true)
      add(:game_def, :map, null: false)
      add(:card_db, :map, null: false)
      add(:subscribers, :integer)
      add(:public, :boolean)
      timestamps()
    end
  end
end
